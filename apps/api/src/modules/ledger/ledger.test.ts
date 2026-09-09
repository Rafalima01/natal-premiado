import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { toCents, type Cents, type LedgerReason, type LedgerSource } from '@natal/contracts';
import type { Env } from '../../config/env.js';
import { closePool, createPool, getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/tx.js';
import { newId } from '../../shared/ids.js';
import { ensureWallets, findWallet } from '../wallets/repository.js';
import { assertFinancialSchema } from './schema-check.js';
import { postOperation } from './service.js';

/**
 * Suíte financeira — exige PostgreSQL real (ADR 0002, P4 / B3).
 *
 * Rode com `npm run test:financial --workspace @natal/api`, que sobe um
 * PostgreSQL efêmero, aplica as migrations, cria `app_login` e destrói tudo ao
 * final. Concorrência e privilégio não se simulam com mock: os bugs que estes
 * testes procuram só existem quando há um banco de verdade serializando escritas.
 *
 * Sem `TEST_DATABASE_URL` os testes pulam — para o CI sem Docker não falhar por
 * ambiente. O que NÃO pula em silêncio são os testes de segurança: ver
 * `security.test.ts`.
 */

const TEST_DATABASE_URL = process.env['TEST_DATABASE_URL'];

if (TEST_DATABASE_URL && TEST_DATABASE_URL === process.env['DATABASE_URL']) {
  throw new Error(
    'TEST_DATABASE_URL e DATABASE_URL apontam para o mesmo banco. A suíte financeira escreve dados: use um banco dedicado.',
  );
}

const skip = TEST_DATABASE_URL ? false : 'TEST_DATABASE_URL ausente — suíte financeira pulada';

/** Jogador novo a cada execução: o ledger é append-only e não há como limpá-lo. */
async function makePlayer(): Promise<string> {
  const id = newId();
  await getPool().query(
    `INSERT INTO players (id, auth_user_id, display_name, email)
          VALUES ($1, $2, 'Teste Financeiro', $3)`,
    [id, newId(), `fin-${id}@teste.local`],
  );
  await ensureWallets(getPool(), id);
  return id;
}

const post = (
  playerId: string,
  reason: LedgerReason,
  source: LedgerSource,
  referenceId: string,
  amountCents: Cents,
) => withTransaction((client) => postOperation(client, { playerId, reason, source, referenceId, amountCents }));

const balanceOf = async (playerId: string, kind: 'CASH' | 'BONUS'): Promise<number> => {
  const wallet = await findWallet(getPool(), playerId, kind, 'BRL');
  assert.ok(wallet, `carteira ${kind} deveria existir`);
  return wallet.balanceCents;
};

describe('domínio financeiro', { skip }, () => {
  before(async () => {
    createPool({ DATABASE_URL: TEST_DATABASE_URL, DATABASE_POOL_MAX: 8 } as Env);
    await assertFinancialSchema(getPool());
  });

  after(async () => {
    await closePool();
  });

  // --- TESTE 1 ------------------------------------------------------------
  it('1. idempotência: a mesma chave aplicada N vezes move o saldo uma única vez', async () => {
    const player = await makePlayer();
    const reference = `dep-${newId()}`;

    const results = [];
    for (let i = 0; i < 5; i += 1) {
      results.push(await post(player, 'deposit.settled', 'vertex', reference, toCents(10_000)));
    }

    const applied = results.filter((r) => r.applied);
    assert.equal(applied.length, 1, 'exatamente uma chamada deve ter aplicado a operação');

    const ids = new Set(results.map((r) => r.operationId));
    assert.equal(ids.size, 1, 'todas as chamadas devem devolver a mesma operação');

    // Retentativa devolve sucesso, não erro: quem repete não precisa saber que repetiu.
    for (const result of results) assert.equal(result.entries.length, 1);

    assert.equal(await balanceOf(player, 'CASH'), 10_000, 'saldo movido exatamente uma vez');

    const ops = await getPool().query<{ n: string }>(
      'SELECT count(*)::text AS n FROM ledger_operations WHERE player_id = $1',
      [player],
    );
    assert.equal(ops.rows[0]?.n, '1');
  });

  it('1b. a mesma referência com reason diferente NÃO cria segunda operação', async () => {
    // Esta é a falha que `UNIQUE (reason, reference_id)` deixaria passar, e é a
    // razão de a chave ser (source, reference_id) — ADR 0002, P1.
    const player = await makePlayer();
    const reference = `evento-${newId()}`;

    await post(player, 'deposit.settled', 'vertex', reference, toCents(5_000));
    const segunda = await post(player, 'deposit.settled', 'vertex', reference, toCents(5_000));

    assert.equal(segunda.applied, false);
    assert.equal(await balanceOf(player, 'CASH'), 5_000, 'crédito não pode ser aplicado duas vezes');
  });

  // --- TESTE 2 ------------------------------------------------------------
  it('2. créditos concorrentes: saldo final é exato, sem atualização perdida', async () => {
    const player = await makePlayer();
    const N = 20;
    const VALOR = 137;

    await Promise.all(
      Array.from({ length: N }, (_, i) =>
        post(player, 'deposit.settled', 'vertex', `conc-${newId()}-${i}`, toCents(VALOR)),
      ),
    );

    assert.equal(await balanceOf(player, 'CASH'), N * VALOR);

    const entries = await getPool().query<{ n: string }>(
      `SELECT count(*)::text AS n FROM wallet_entries e
         JOIN ledger_operations o ON o.id = e.operation_id
        WHERE o.player_id = $1`,
      [player],
    );
    assert.equal(entries.rows[0]?.n, String(N));
  });

  // --- TESTE 3 ------------------------------------------------------------
  it('3. débitos concorrentes: CASH nunca fica negativo', async () => {
    const player = await makePlayer();
    await post(player, 'deposit.settled', 'vertex', `seed-${newId()}`, toCents(1_000));

    const N = 12;
    const VALOR = 300; // só 3 cabem em 1000

    const results = await Promise.allSettled(
      Array.from({ length: N }, (_, i) =>
        post(player, 'game.purchase', 'platform', `debito-${newId()}-${i}`, toCents(VALOR)),
      ),
    );

    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const falhas = results.filter((r) => r.status === 'rejected').length;

    assert.equal(ok + falhas, N);
    assert.equal(ok, 3, 'exatamente 3 débitos de 300 cabem em 1000');

    const saldo = await balanceOf(player, 'CASH');
    assert.ok(saldo >= 0, `saldo não pode ser negativo, obtido ${saldo}`);
    assert.equal(saldo, 1_000 - ok * VALOR, 'saldo coerente com os débitos aceitos');
  });

  // --- TESTE 4 ------------------------------------------------------------
  it('4. atomicidade: falha no meio de operação multi-perna reverte tudo', async () => {
    const player = await makePlayer();
    // BONUS zerado: a perna de débito da transferência vai falhar.
    const antesCash = await balanceOf(player, 'CASH');
    const antesBonus = await balanceOf(player, 'BONUS');
    const reference = `transf-falha-${newId()}`;

    await assert.rejects(
      post(player, 'bonus.converted', 'platform', reference, toCents(500)),
      (error: Error & { code?: string }) => {
        assert.equal(error.code, 'INSUFFICIENT_FUNDS');
        return true;
      },
    );

    assert.equal(await balanceOf(player, 'CASH'), antesCash, 'saldo CASH intocado');
    assert.equal(await balanceOf(player, 'BONUS'), antesBonus, 'saldo BONUS intocado');

    // A operação foi inserida ANTES do movimento de saldo. Se o rollback não
    // fosse completo, ela teria sobrado — e bloquearia para sempre a chave de
    // idempotência de um evento que nunca aconteceu.
    const ops = await getPool().query<{ n: string }>(
      'SELECT count(*)::text AS n FROM ledger_operations WHERE reference_id = $1',
      [reference],
    );
    assert.equal(ops.rows[0]?.n, '0', 'nenhuma operação parcial deve permanecer');
  });

  // --- TESTE 6 ------------------------------------------------------------
  it('6. reconciliação: soma dos lançamentos = saldo, e balance_after é coerente', async () => {
    const player = await makePlayer();
    await post(player, 'deposit.settled', 'vertex', `r1-${newId()}`, toCents(10_000));
    await post(player, 'prize.credit', 'platform', `r2-${newId()}`, toCents(2_500));
    await post(player, 'game.purchase', 'platform', `r3-${newId()}`, toCents(3_000));

    const cash = await findWallet(getPool(), player, 'CASH', 'BRL');
    assert.ok(cash);

    const soma = await getPool().query<{ total: string | null }>(
      'SELECT sum(amount_cents)::text AS total FROM wallet_entries WHERE wallet_id = $1',
      [cash.id],
    );
    assert.equal(
      Number(soma.rows[0]?.total ?? 0),
      cash.balanceCents,
      'soma do ledger deve bater com o saldo corrente',
    );

    // balance_after de cada perna precisa ser o acumulado até ali.
    const entries = await getPool().query<{ amount_cents: string; balance_after_cents: string }>(
      `SELECT e.amount_cents, e.balance_after_cents
         FROM wallet_entries e
         JOIN ledger_operations o ON o.id = e.operation_id
        WHERE e.wallet_id = $1
     ORDER BY o.created_at ASC, o.id ASC, e.seq ASC`,
      [cash.id],
    );

    let acumulado = 0;
    for (const entry of entries.rows) {
      acumulado += Number(entry.amount_cents);
      assert.equal(
        Number(entry.balance_after_cents),
        acumulado,
        'balance_after_cents deve ser o acumulado da sequência',
      );
    }
  });

  // --- TESTE 7 ------------------------------------------------------------
  it('7. BONUS é carteira separada e não se mistura com CASH', async () => {
    const player = await makePlayer();
    await post(player, 'deposit.settled', 'vertex', `b1-${newId()}`, toCents(7_000));
    await post(player, 'bonus.granted', 'platform', `b2-${newId()}`, toCents(3_000));

    assert.equal(await balanceOf(player, 'CASH'), 7_000, 'crédito de bônus não entra em CASH');
    assert.equal(await balanceOf(player, 'BONUS'), 3_000);

    // Nenhuma coluna persiste um total combinado: o esquema não tem onde
    // guardar "saldo sacável", então BONUS não vira sacável por omissão.
    const colunas = await getPool().query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'wallets' AND table_schema = 'public'`,
    );
    const nomes = colunas.rows.map((c) => c.column_name);
    for (const proibida of ['total_balance_cents', 'withdrawable_cents', 'total_cents']) {
      assert.ok(!nomes.includes(proibida), `wallets não deve ter coluna ${proibida}`);
    }

    // Cada carteira tem sua própria linha: um saldo não pode "vazar" para a outra.
    const linhas = await getPool().query<{ kind: string; balance_cents: string }>(
      'SELECT kind, balance_cents FROM wallets WHERE player_id = $1 ORDER BY kind',
      [player],
    );
    assert.deepEqual(
      linhas.rows.map((r) => [r.kind, Number(r.balance_cents)]),
      [
        ['BONUS', 3_000],
        ['CASH', 7_000],
      ],
    );
  });

  // --- TESTE 9 ------------------------------------------------------------
  it('9. transferência interna: as pernas somam zero', async () => {
    const player = await makePlayer();
    await post(player, 'bonus.granted', 'platform', `t1-${newId()}`, toCents(4_000));

    const resultado = await post(player, 'bonus.converted', 'platform', `t2-${newId()}`, toCents(1_500));
    assert.equal(resultado.applied, true);
    assert.equal(resultado.entries.length, 2, 'transferência tem exatamente duas pernas');

    const soma = resultado.entries.reduce((acc, e) => acc + e.amountCents, 0);
    assert.equal(soma, 0, 'transferência interna não cria nem destrói dinheiro');

    // Ordem semântica: origem (seq 1) antes do destino (seq 2).
    const porSeq = [...resultado.entries].sort((a, b) => a.seq - b.seq);
    assert.equal(porSeq[0]?.walletKind, 'BONUS');
    assert.ok((porSeq[0]?.amountCents ?? 0) < 0, 'a origem é debitada');
    assert.equal(porSeq[1]?.walletKind, 'CASH');
    assert.ok((porSeq[1]?.amountCents ?? 0) > 0, 'o destino é creditado');

    assert.equal(await balanceOf(player, 'BONUS'), 2_500);
    assert.equal(await balanceOf(player, 'CASH'), 1_500);

    const total = await getPool().query<{ total: string }>(
      `SELECT sum(e.amount_cents)::text AS total
         FROM wallet_entries e WHERE e.operation_id = $1`,
      [resultado.operationId],
    );
    assert.equal(Number(total.rows[0]?.total), 0, 'soma zero também no banco');
  });

  it('a matriz recusa origem não autorizada para o reason', async () => {
    const player = await makePlayer();
    await assert.rejects(
      // `deposit.settled` só pode vir do Vertex; a plataforma não pode se
      // autocreditar um depósito.
      post(player, 'deposit.settled', 'platform', `mau-${newId()}`, toCents(100)),
      (error: Error & { code?: string }) => {
        assert.equal(error.code, 'SOURCE_NOT_ALLOWED_FOR_REASON');
        return true;
      },
    );
  });
});
