import {
  toCents,
  type Currency,
  type LedgerEntryResponse,
  type LedgerReason,
  type LedgerSource,
  type WalletKind,
} from '@natal/contracts';
import type { Executor } from '../players/repository.js';

/**
 * Acesso a `ledger_operations` e `wallet_entries`.
 *
 * As duas tabelas são append-only: este módulo só faz INSERT e SELECT. Não
 * existe função de UPDATE nem de DELETE aqui, e isso não é esquecimento — a
 * aplicação sequer tem privilégio para executá-los (ADR 0002, D3).
 */

export interface LedgerOperation {
  id: string;
  playerId: string;
  source: LedgerSource;
  referenceId: string;
  reason: LedgerReason;
  createdAt: Date;
}

interface OperationRow {
  id: string;
  player_id: string;
  source: string;
  reference_id: string;
  reason: string;
  created_at: Date;
}

const OP_COLUMNS = 'id, player_id, source, reference_id, reason, created_at';

const toOperation = (row: OperationRow): LedgerOperation => ({
  id: row.id,
  playerId: row.player_id,
  source: row.source as LedgerSource,
  referenceId: row.reference_id,
  reason: row.reason as LedgerReason,
  createdAt: row.created_at,
});

export interface InsertOperationInput {
  id: string;
  playerId: string;
  source: LedgerSource;
  referenceId: string;
  reason: LedgerReason;
}

export interface InsertOperationResult {
  operation: LedgerOperation;
  /** false quando a chave de idempotência já existia: nada deve ser movimentado. */
  inserted: boolean;
}

/**
 * Registra a operação, ou devolve a que já existe para a mesma chave.
 *
 * A barreira de idempotência é `(source, reference_id)` (ADR 0002, P1) e roda
 * ANTES de qualquer movimento de saldo. Invertida, uma retentativa moveria
 * dinheiro para só depois descobrir que era duplicata.
 *
 * DESVIO DELIBERADO do padrão usado em `players`: lá o upsert é
 * `ON CONFLICT ... DO UPDATE` para que o RETURNING sempre traga linha. Aqui
 * isso é impossível — `ledger_operations` tem gatilho que rejeita UPDATE, e o
 * caminho DO UPDATE de um ON CONFLICT dispara gatilhos de UPDATE. Usar o padrão
 * de `players` faria toda retentativa estourar erro de append-only.
 *
 * Então: `DO NOTHING` e, em caso de conflito, um SELECT. O SELECT é correto sob
 * READ COMMITTED porque o próprio INSERT bloqueia até a transação concorrente
 * terminar; quando ele volta sem linha, a operação rival já commitou e o SELECT
 * seguinte — com snapshot novo — enxerga a linha.
 */
export async function insertOperation(
  db: Executor,
  input: InsertOperationInput,
): Promise<InsertOperationResult> {
  const inserted = await db.query<OperationRow>(
    `INSERT INTO ledger_operations (id, player_id, source, reference_id, reason)
          VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT ON CONSTRAINT ledger_operations_idempotency_key DO NOTHING
       RETURNING ${OP_COLUMNS}`,
    [input.id, input.playerId, input.source, input.referenceId, input.reason],
  );

  const row = inserted.rows[0];
  if (row) return { operation: toOperation(row), inserted: true };

  const existing = await db.query<OperationRow>(
    `SELECT ${OP_COLUMNS} FROM ledger_operations WHERE source = $1 AND reference_id = $2`,
    [input.source, input.referenceId],
  );

  const found = existing.rows[0];
  if (!found) {
    // Só acontece se a transação concorrente que causou o conflito tiver dado
    // ROLLBACK entre o INSERT e o SELECT. Falha alto: o chamador repete e a
    // segunda tentativa insere normalmente. Seguir em frente aqui significaria
    // movimentar saldo sem barreira de idempotência.
    throw new Error(
      'Conflito de idempotência sem linha correspondente; a operação concorrente foi revertida. Repita a requisição.',
    );
  }

  return { operation: toOperation(found), inserted: false };
}

export interface InsertEntryInput {
  id: string;
  operationId: string;
  walletId: string;
  seq: number;
  amountCents: number;
  balanceAfterCents: number;
}

export async function insertEntry(db: Executor, input: InsertEntryInput): Promise<void> {
  await db.query(
    `INSERT INTO wallet_entries (id, operation_id, wallet_id, seq, amount_cents, balance_after_cents)
          VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.id,
      input.operationId,
      input.walletId,
      input.seq,
      input.amountCents,
      input.balanceAfterCents,
    ],
  );
}

// --- Leitura ----------------------------------------------------------------

interface EntryRow {
  id: string;
  operation_id: string;
  seq: number;
  amount_cents: string;
  balance_after_cents: string;
  wallet_kind: string;
  currency: string;
  reason: string;
  source: string;
  operation_created_at: Date;
}

const toEntryResponse = (row: EntryRow): LedgerEntryResponse => ({
  entryId: row.id,
  operationId: row.operation_id,
  seq: row.seq,
  walletKind: row.wallet_kind as WalletKind,
  currency: row.currency as Currency,
  amountCents: toCents(Number(row.amount_cents)),
  balanceAfterCents: toCents(Number(row.balance_after_cents)),
  reason: row.reason as LedgerReason,
  source: row.source as LedgerSource,
  createdAt: row.operation_created_at.toISOString(),
});

/** Posição na ordenação estável. Serializada em cursor opaco pela rota. */
export interface LedgerCursor {
  createdAt: string;
  operationId: string;
  seq: number;
}

/** Todas as pernas de uma operação, em ordem. */
export async function listEntriesByOperation(
  db: Executor,
  operationId: string,
): Promise<LedgerEntryResponse[]> {
  const result = await db.query<EntryRow>(
    `${ENTRY_SELECT} WHERE e.operation_id = $1 ORDER BY e.seq ASC`,
    [operationId],
  );
  return result.rows.map(toEntryResponse);
}

const ENTRY_SELECT = `
  SELECT e.id, e.operation_id, e.seq, e.amount_cents, e.balance_after_cents,
         w.kind AS wallet_kind, w.currency,
         o.reason, o.source, o.created_at AS operation_created_at
    FROM wallet_entries e
    JOIN ledger_operations o ON o.id = e.operation_id
    JOIN wallets w           ON w.id = e.wallet_id`;

/**
 * Página do extrato do jogador.
 *
 * Ordenação por `(operações.created_at, operações.id, entries.seq)` — total e
 * estável. `created_at` sozinho não serve: as pernas de uma mesma operação
 * compartilham o instante.
 *
 * Cursor, nunca OFFSET. O ledger é append-only e cresce sem parar; OFFSET
 * degrada com o tamanho e devolve resultado instável quando há inserção durante
 * a navegação — o leitor pularia ou repetiria lançamentos.
 *
 * Pede `limit + 1` linhas para saber se há próxima página sem um COUNT extra.
 */
export async function listEntriesPage(
  db: Executor,
  playerId: string,
  limit: number,
  cursor: LedgerCursor | null,
): Promise<{ entries: LedgerEntryResponse[]; nextCursor: LedgerCursor | null }> {
  const params: unknown[] = [playerId, limit + 1];
  let keyset = '';

  if (cursor) {
    // Comparação de tupla: o Postgres a resolve com o índice, e ela expressa
    // "estritamente anterior nesta ordenação" sem a árvore de ORs equivalente.
    keyset = ` AND (o.created_at, o.id, e.seq) < ($3::timestamptz, $4::uuid, $5::smallint)`;
    params.push(cursor.createdAt, cursor.operationId, cursor.seq);
  }

  const result = await db.query<EntryRow>(
    `${ENTRY_SELECT}
      WHERE o.player_id = $1${keyset}
   ORDER BY o.created_at DESC, o.id DESC, e.seq DESC
      LIMIT $2`,
    params,
  );

  const hasMore = result.rows.length > limit;
  const rows = hasMore ? result.rows.slice(0, limit) : result.rows;
  const entries = rows.map(toEntryResponse);

  const last = rows[rows.length - 1];
  const nextCursor =
    hasMore && last
      ? {
          createdAt: last.operation_created_at.toISOString(),
          operationId: last.operation_id,
          seq: last.seq,
        }
      : null;

  return { entries, nextCursor };
}
