import { toCents, type Cents, type Currency, type WalletKind } from '@natal/contracts';
import { REQUIRED_WALLET_KINDS } from '@natal/contracts';
import type { Executor } from '../players/repository.js';
import { newId } from '../../shared/ids.js';

/**
 * Acesso a `wallets`.
 *
 * O saldo é atualizado sempre por UPDATE atômico com RETURNING — nunca por
 * SELECT seguido de UPDATE. A serialização vem do lock de linha do próprio
 * UPDATE; um SELECT antes abriria a janela em que duas transações leem o mesmo
 * saldo e uma sobrescreve a outra (atualização perdida).
 */

/** Linha crua. Não sai do módulo: `balance_cents` chega como string. */
interface WalletRow {
  id: string;
  player_id: string;
  kind: string;
  currency: string;
  balance_cents: string;
  created_at: Date;
}

export interface Wallet {
  id: string;
  playerId: string;
  kind: WalletKind;
  currency: Currency;
  balanceCents: Cents;
}

const COLUMNS = 'id, player_id, kind, currency, balance_cents, created_at';

/**
 * Converte a linha do banco.
 *
 * O driver devolve BIGINT como string de propósito (ver `db/pool.ts`): acima de
 * 2^53 um number perde precisão silenciosamente. A conversão acontece só aqui,
 * na borda, e passa por `toCents`, que rejeita não-inteiro e valor fora da
 * faixa. É esta função que impede um valor corrompido de entrar no domínio.
 */
function toWallet(row: WalletRow): Wallet {
  return {
    id: row.id,
    playerId: row.player_id,
    kind: row.kind as WalletKind,
    currency: row.currency as Currency,
    balanceCents: toCents(Number(row.balance_cents)),
  };
}

/**
 * Garante as carteiras obrigatórias do jogador. Idempotente.
 *
 * INSERT multi-linha único, com as carteiras em ordem fixa
 * (`REQUIRED_WALLET_KINDS`). Duas transações concorrentes tomam os locks na
 * mesma sequência e por isso não travam em deadlock — um laço com ordem
 * variável travaria (ADR 0002, D4).
 *
 * `DO UPDATE` em um campo inócuo, e não `DO NOTHING`: com DO NOTHING o comando
 * não retorna linha em caso de conflito, obrigando a um SELECT extra. Aqui isso
 * é seguro porque `wallets` não é append-only — o UPDATE de saldo é parte do
 * desenho, e não há gatilho que o rejeite.
 */
export async function ensureWallets(
  db: Executor,
  playerId: string,
  currency: Currency = 'BRL',
): Promise<Wallet[]> {
  const ids = REQUIRED_WALLET_KINDS.map(() => newId());

  const result = await db.query<WalletRow>(
    `INSERT INTO wallets (id, player_id, kind, currency)
          SELECT * FROM unnest($1::uuid[], $2::uuid[], $3::text[], $4::text[])
     ON CONFLICT ON CONSTRAINT wallets_player_kind_currency_key
     DO UPDATE SET updated_at = now()
       RETURNING ${COLUMNS}`,
    [
      ids,
      REQUIRED_WALLET_KINDS.map(() => playerId),
      [...REQUIRED_WALLET_KINDS],
      REQUIRED_WALLET_KINDS.map(() => currency),
    ],
  );

  return result.rows.map(toWallet);
}

/** Carteiras do jogador, em ordem estável para a resposta da API. */
export async function listByPlayer(db: Executor, playerId: string): Promise<Wallet[]> {
  const result = await db.query<WalletRow>(
    `SELECT ${COLUMNS} FROM wallets WHERE player_id = $1 ORDER BY kind, currency`,
    [playerId],
  );
  return result.rows.map(toWallet);
}

export async function findWallet(
  db: Executor,
  playerId: string,
  kind: WalletKind,
  currency: Currency,
): Promise<Wallet | null> {
  const result = await db.query<WalletRow>(
    `SELECT ${COLUMNS} FROM wallets WHERE player_id = $1 AND kind = $2 AND currency = $3`,
    [playerId, kind, currency],
  );
  const row = result.rows[0];
  return row ? toWallet(row) : null;
}

/**
 * Aplica um delta ao saldo, atomicamente.
 *
 * `delta` negativo é débito. A condição `balance_cents + $delta >= 0` está no
 * mesmo comando que a escrita: verificar e debitar viram uma operação só, sem
 * janela entre as duas. Nenhuma linha retornada significa saldo insuficiente —
 * não significa carteira inexistente, que é verificada antes.
 *
 * Devolve o saldo depois do lançamento, que é o que vai para
 * `wallet_entries.balance_after_cents`.
 */
export async function applyBalanceDelta(
  db: Executor,
  walletId: string,
  deltaCents: number,
): Promise<Cents | null> {
  const result = await db.query<{ balance_cents: string }>(
    `UPDATE wallets
        SET balance_cents = balance_cents + $2
      WHERE id = $1
        AND balance_cents + $2 >= 0
  RETURNING balance_cents`,
    [walletId, deltaCents],
  );

  const row = result.rows[0];
  return row ? toCents(Number(row.balance_cents)) : null;
}
