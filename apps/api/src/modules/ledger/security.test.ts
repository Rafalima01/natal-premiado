import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import pg from 'pg';
import { toCents } from '@natal/contracts';
import type { Env } from '../../config/env.js';
import { closePool, createPool, getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/tx.js';
import { newId } from '../../shared/ids.js';
import { ensureWallets } from '../wallets/repository.js';
import { assertFinancialSchema } from './schema-check.js';
import { postOperation } from './service.js';

/**
 * Provas de privilégio real (ADR 0002, testes 5 e 8).
 *
 * Estes testes conectam como `app_login` — a MESMA identidade que a aplicação
 * usa em runtime — e tentam violar o append-only. É a única forma de provar a
 * garantia: conectado como dono, um UPDATE passaria, e o teste estaria medindo
 * outra coisa.
 *
 * REGRA DA DECISÃO C: se houver banco de teste configurado mas
 * `TEST_APP_DATABASE_URL` estiver ausente, estes testes FALHAM com erro de
 * configuração. Não pulam. Um teste de append-only que se auto-pula é pior que
 * nenhum: reporta verde sobre uma garantia que ninguém verificou.
 *
 * Quando não há banco nenhum configurado (`TEST_DATABASE_URL` ausente), a
 * camada de integração inteira está fora de escopo e a suíte pula — é o caso do
 * CI sem Docker, e aí não existe garantia sendo silenciada.
 */

const TEST_DATABASE_URL = process.env['TEST_DATABASE_URL'];
const TEST_APP_DATABASE_URL = process.env['TEST_APP_DATABASE_URL'];

if (TEST_DATABASE_URL && !TEST_APP_DATABASE_URL) {
  throw new Error(
    'TEST_APP_DATABASE_URL ausente. Os testes de append-only e ownership precisam conectar como app_login ' +
      '— conectados como dono eles passariam sem provar nada. Rode `npm run test:financial`, ' +
      'que cria o login e define a variável (ADR 0002, decisão C).',
  );
}

const skip = TEST_DATABASE_URL ? false : 'TEST_DATABASE_URL ausente — camada de integração fora de escopo';

const PG_INSUFFICIENT_PRIVILEGE = '42501';

let appPool: pg.Pool;

/** Nome do papel com que a aplicação conecta. Usado nas asserções de ownership. */
let appRoleName: string;

describe('segurança do ledger', { skip }, () => {
  let operationId: string;
  let entryId: string;
  let walletId: string;

  before(async () => {
    createPool({ DATABASE_URL: TEST_DATABASE_URL, DATABASE_POOL_MAX: 4 } as Env);
    await assertFinancialSchema(getPool());
    appPool = new pg.Pool({ connectionString: TEST_APP_DATABASE_URL, max: 3 });

    const who = await appPool.query<{ current_user: string }>('select current_user');
    appRoleName = who.rows[0]?.current_user ?? '';
    assert.ok(appRoleName, 'não foi possível identificar o papel da aplicação');

    // Cria um lançamento real para ter alvo concreto nas tentativas de violação.
    const playerId = newId();
    await getPool().query(
      `INSERT INTO players (id, auth_user_id, display_name, email)
            VALUES ($1, $2, 'Teste Segurança', $3)`,
      [playerId, newId(), `sec-${playerId}@teste.local`],
    );
    const wallets = await ensureWallets(getPool(), playerId);
    walletId = wallets[0]?.id ?? '';

    const result = await withTransaction((client) =>
      postOperation(client, {
        playerId,
        reason: 'deposit.settled',
        source: 'vertex',
        referenceId: `sec-${newId()}`,
        amountCents: toCents(1_234),
      }),
    );
    operationId = result.operationId;
    entryId = result.entries[0]?.entryId ?? '';
    assert.ok(entryId, 'o lançamento de apoio deveria existir');
  });

  after(async () => {
    await appPool?.end();
    await closePool();
  });

  // --- TESTE 5 ------------------------------------------------------------
  describe('5. append-only', () => {
    const rejeita = async (sql: string, params: unknown[] = []) => {
      await assert.rejects(
        appPool.query(sql, params),
        (error: Error & { code?: string }) => {
          assert.equal(
            error.code,
            PG_INSUFFICIENT_PRIVILEGE,
            `esperado 42501, obtido ${error.code}: ${error.message}`,
          );
          return true;
        },
      );
    };

    it('app_login não consegue UPDATE em ledger_operations', async () => {
      await rejeita('UPDATE ledger_operations SET reason = $1 WHERE id = $2', [
        'adjustment.credit',
        operationId,
      ]);
    });

    it('app_login não consegue DELETE em ledger_operations', async () => {
      await rejeita('DELETE FROM ledger_operations WHERE id = $1', [operationId]);
    });

    it('app_login não consegue UPDATE em wallet_entries', async () => {
      await rejeita('UPDATE wallet_entries SET amount_cents = 1 WHERE id = $1', [entryId]);
    });

    it('app_login não consegue DELETE em wallet_entries', async () => {
      await rejeita('DELETE FROM wallet_entries WHERE id = $1', [entryId]);
    });

    it('app_login não consegue TRUNCATE nas tabelas de ledger', async () => {
      await rejeita('TRUNCATE TABLE wallet_entries');
      await rejeita('TRUNCATE TABLE ledger_operations');
    });

    it('app_login não consegue ALTER nem DROP', async () => {
      await assert.rejects(appPool.query('ALTER TABLE wallet_entries ADD COLUMN x int'));
      await assert.rejects(appPool.query('DROP TABLE wallet_entries'));
    });

    it('app_login CONSEGUE ler e inserir — a garantia não é bloqueio geral', async () => {
      // Contraprova: se o app não pudesse nem inserir, os testes acima
      // passariam por falta de acesso ao banco, não por append-only.
      const leitura = await appPool.query('SELECT count(*) FROM wallet_entries');
      assert.ok(leitura.rowCount === 1);

      const updateWallet = await appPool.query(
        'UPDATE wallets SET balance_cents = balance_cents + 0 WHERE id = $1',
        [walletId],
      );
      assert.equal(updateWallet.rowCount, 1, 'saldo corrente é atualizável por definição');
    });
  });

  // --- TESTE 8 ------------------------------------------------------------
  describe('8. ownership', () => {
    it('app_login não é dono de nenhuma tabela financeira', async () => {
      const result = await getPool().query<{ tablename: string; tableowner: string }>(
        `SELECT tablename, tableowner FROM pg_tables
          WHERE schemaname = 'public'
            AND tablename IN ('wallets', 'ledger_operations', 'wallet_entries', 'players')`,
      );
      assert.equal(result.rows.length, 4, 'as quatro tabelas devem existir');

      for (const row of result.rows) {
        assert.notEqual(
          row.tableowner,
          appRoleName,
          `${row.tablename} não pode pertencer ao papel da aplicação`,
        );
        assert.equal(row.tableowner, 'migration_role', `${row.tablename} deve pertencer a migration_role`);
      }
    });

    it('app_login não é dono do schema public', async () => {
      const result = await getPool().query<{ dono: string }>(
        `SELECT pg_get_userbyid(nspowner) AS dono FROM pg_namespace WHERE nspname = 'public'`,
      );
      assert.notEqual(result.rows[0]?.dono, appRoleName);
      assert.equal(result.rows[0]?.dono, 'migration_role');
    });

    it('app_login não é superusuário e não pode criar papéis nem bancos', async () => {
      const result = await appPool.query<{
        rolsuper: boolean;
        rolcreaterole: boolean;
        rolcreatedb: boolean;
        rolbypassrls: boolean;
      }>(
        `SELECT rolsuper, rolcreaterole, rolcreatedb, rolbypassrls
           FROM pg_roles WHERE rolname = current_user`,
      );
      const role = result.rows[0];
      assert.ok(role, 'papel da aplicação não encontrado');
      assert.equal(role.rolsuper, false, 'a aplicação não pode ser superusuário');
      assert.equal(role.rolcreaterole, false);
      assert.equal(role.rolcreatedb, false);
      assert.equal(role.rolbypassrls, false);
    });

    it('app_login não tem CREATE no schema public', async () => {
      // Sem CREATE ela não cria tabela, view nem função — e portanto não
      // consegue contornar o modelo criando um objeto do qual seria dona.
      const result = await appPool.query<{ create: boolean; usage: boolean }>(
        `SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS create,
                has_schema_privilege(current_user, 'public', 'USAGE')  AS usage`,
      );
      assert.equal(result.rows[0]?.create, false, 'a aplicação não pode criar objetos');
      assert.equal(result.rows[0]?.usage, true, 'mas precisa enxergar o schema');
    });

    it('os privilégios efetivos são exatamente os previstos', async () => {
      const check = async (table: string, privilege: string) => {
        const result = await appPool.query<{ ok: boolean }>(
          'SELECT has_table_privilege(current_user, $1, $2) AS ok',
          [`public.${table}`, privilege],
        );
        return result.rows[0]?.ok === true;
      };

      for (const table of ['ledger_operations', 'wallet_entries']) {
        assert.equal(await check(table, 'SELECT'), true, `${table}: SELECT esperado`);
        assert.equal(await check(table, 'INSERT'), true, `${table}: INSERT esperado`);
        assert.equal(await check(table, 'UPDATE'), false, `${table}: UPDATE NÃO deve existir`);
        assert.equal(await check(table, 'DELETE'), false, `${table}: DELETE NÃO deve existir`);
        assert.equal(await check(table, 'TRUNCATE'), false, `${table}: TRUNCATE NÃO deve existir`);
      }

      assert.equal(await check('wallets', 'UPDATE'), true, 'saldo corrente é atualizável');
      assert.equal(await check('wallets', 'DELETE'), false, 'carteira não se apaga');
    });
  });
});
