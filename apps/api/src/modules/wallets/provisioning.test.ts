import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Env } from '../../config/env.js';
import { closePool, createPool, getPool } from '../../db/pool.js';
import type { AuthClaims } from '../auth/jwt.js';
import { newId } from '../../shared/ids.js';
import { assertFinancialSchema } from '../ledger/schema-check.js';
import { resolveIdentity } from './service.js';

/**
 * TESTE 10 — provisionamento concorrente (ADR 0002, D4).
 *
 * Prova que o estado `player existe / wallet não existe` não sobrevive, e que
 * o caminho concorrente não duplica carteira nem trava em deadlock. O deadlock
 * é o risco específico de inserir várias carteiras: duas transações que peguem
 * os locks em ordens diferentes travam uma na outra. Por isso o INSERT é
 * multi-linha com ordem fixa.
 */

const TEST_DATABASE_URL = process.env['TEST_DATABASE_URL'];

if (TEST_DATABASE_URL && TEST_DATABASE_URL === process.env['DATABASE_URL']) {
  throw new Error(
    'TEST_DATABASE_URL e DATABASE_URL apontam para o mesmo banco. Use um banco dedicado a teste.',
  );
}

const skip = TEST_DATABASE_URL ? false : 'TEST_DATABASE_URL ausente — teste de integração pulado';

describe('provisionamento de identidade e carteiras', { skip }, () => {
  before(async () => {
    createPool({ DATABASE_URL: TEST_DATABASE_URL, DATABASE_POOL_MAX: 8 } as Env);
    await assertFinancialSchema(getPool());
  });

  after(async () => {
    await closePool();
  });

  it('10. acessos simultâneos criam 1 player, 1 CASH e 1 BONUS, sem deadlock', async () => {
    const subject = newId();
    const claims: AuthClaims = {
      subject,
      email: `prov-${subject}@teste.local`,
      displayNameHint: 'Provisionamento Concorrente',
    };

    const N = 10;
    const resultados = await Promise.all(Array.from({ length: N }, () => resolveIdentity(claims)));

    const ids = new Set(resultados.map((r) => r.player.id));
    assert.equal(ids.size, 1, 'todas as chamadas devem resolver para o mesmo player');

    const playerId = resultados[0]?.player.id;
    assert.ok(playerId);

    const players = await getPool().query<{ n: string }>(
      'SELECT count(*)::text AS n FROM players WHERE auth_user_id = $1',
      [subject],
    );
    assert.equal(players.rows[0]?.n, '1', 'exatamente um player no banco');

    const wallets = await getPool().query<{ kind: string; n: string }>(
      `SELECT kind, count(*)::text AS n FROM wallets
        WHERE player_id = $1 GROUP BY kind ORDER BY kind`,
      [playerId],
    );
    assert.deepEqual(
      wallets.rows.map((r) => [r.kind, r.n]),
      [
        ['BONUS', '1'],
        ['CASH', '1'],
      ],
      'uma carteira de cada tipo, sem duplicata',
    );

    const saldos = await getPool().query<{ balance_cents: string }>(
      'SELECT balance_cents FROM wallets WHERE player_id = $1',
      [playerId],
    );
    for (const row of saldos.rows) {
      assert.equal(Number(row.balance_cents), 0, 'carteira nasce zerada');
    }
  });

  it('um jogador criado sem carteiras recebe as dele no próximo acesso', async () => {
    // Simula o jogador da Fase 2, anterior à existência de wallets. O caminho
    // rápido de `resolveIdentity` precisa detectar a lacuna e completá-la, em
    // vez de devolver uma lista vazia de saldos.
    const subject = newId();
    const playerId = newId();
    await getPool().query(
      `INSERT INTO players (id, auth_user_id, display_name, email)
            VALUES ($1, $2, 'Legado Fase 2', $3)`,
      [playerId, subject, `legado-${playerId}@teste.local`],
    );

    const claims: AuthClaims = {
      subject,
      email: `legado-${playerId}@teste.local`,
      displayNameHint: undefined,
    };
    const resolved = await resolveIdentity(claims);
    assert.equal(resolved.player.id, playerId, 'deve reaproveitar o player existente');

    const wallets = await getPool().query<{ n: string }>(
      'SELECT count(*)::text AS n FROM wallets WHERE player_id = $1',
      [playerId],
    );
    assert.equal(wallets.rows[0]?.n, '2', 'as duas carteiras devem ter sido criadas');
  });
});
