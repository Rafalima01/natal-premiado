import {
  isSourceAllowed,
  reasonRule,
  toPositiveCents,
  type Cents,
  type Currency,
  type LedgerEntryResponse,
  type LedgerReason,
  type LedgerSource,
  type WalletKind,
} from '@natal/contracts';
import type { PoolClient } from 'pg';
import { conflict, unprocessable } from '../../shared/errors.js';
import { newId } from '../../shared/ids.js';
import { applyBalanceDelta, findWallet } from '../wallets/repository.js';
import { insertEntry, insertOperation, listEntriesByOperation } from './repository.js';

/**
 * Serviços financeiros internos (ADR 0002, D1 / P2).
 *
 * NÃO existe rota HTTP que chegue aqui. Crédito, débito e transferência são
 * funções do processo, e assim permanecem na Fase 3: o contrato de integração
 * externa está bloqueado, e abrir a porta antes do contrato significa
 * construí-la duas vezes.
 *
 * O chamador informa um `reason`. A carteira e a direção vêm da matriz em
 * @natal/contracts — nunca do chamador. É isso que torna impossível uma origem
 * externa dizer "credite CASH em 100000" e ser obedecida.
 *
 * Todas as funções exigem `PoolClient`, não `Pool`: movimentação financeira só
 * acontece dentro de `withTransaction`. O tipo é o que impede o descuido.
 */

export interface PostOperationInput {
  playerId: string;
  reason: LedgerReason;
  source: LedgerSource;
  /** Id do evento na origem. Imutável entre retentativas. */
  referenceId: string;
  /** Sempre positivo. O sinal é derivado da matriz, não informado. */
  amountCents: Cents;
  currency?: Currency;
}

export interface PostOperationResult {
  operationId: string;
  entries: LedgerEntryResponse[];
  /** true quando esta chamada criou a operação; false em retentativa. */
  applied: boolean;
}

/** Uma perna resolvida: carteira concreta e delta com sinal. */
interface Leg {
  walletId: string;
  deltaCents: number;
  /** Ordem semântica no extrato (origem antes de destino em transferência). */
  seq: number;
}

/**
 * Registra uma operação financeira e seus lançamentos, atomicamente.
 *
 * Sequência (ADR 0002, D10) — a ordem não é negociável:
 *   1. valida reason, origem e valor
 *   2. resolve as carteiras
 *   3. registra a operação (barreira de idempotência) — ANTES de mover saldo
 *   4. se já existia: devolve a operação e ENCERRA, sem movimentar nada
 *   5. aplica os deltas, em ordem determinística de carteira
 *   6. grava as pernas
 *   7. valida invariantes
 */
export async function postOperation(
  client: PoolClient,
  input: PostOperationInput,
): Promise<PostOperationResult> {
  const currency: Currency = input.currency ?? 'BRL';
  const rule = reasonRule(input.reason);

  if (!isSourceAllowed(input.reason, input.source)) {
    throw unprocessable(
      'SOURCE_NOT_ALLOWED_FOR_REASON',
      `A origem "${input.source}" não pode emitir "${input.reason}".`,
    );
  }

  if (!input.referenceId.trim()) {
    throw unprocessable('REFERENCE_ID_REQUIRED', 'referenceId é obrigatório e não pode ser vazio.');
  }

  // Lança se não for inteiro positivo dentro da faixa. O valor chega sempre
  // positivo; quem decide o sinal é a matriz.
  const amount = toPositiveCents(input.amountCents);

  // --- 2. carteiras -------------------------------------------------------
  const walletFor = async (kind: WalletKind) => {
    const wallet = await findWallet(client, input.playerId, kind, currency);
    if (!wallet) {
      // Não deveria acontecer: as carteiras nascem com o player (D4). Se
      // acontecer, é bug de provisionamento — falhar é melhor que criar
      // carteira no meio de uma movimentação financeira.
      throw unprocessable(
        'WALLET_NOT_PROVISIONED',
        `Carteira ${kind}/${currency} inexistente para o jogador.`,
      );
    }
    return wallet;
  };

  const legs: Leg[] = [];
  if (rule.direction === 'transfer') {
    const from = await walletFor(rule.from);
    const to = await walletFor(rule.to);
    legs.push({ walletId: from.id, deltaCents: -amount, seq: 1 });
    legs.push({ walletId: to.id, deltaCents: amount, seq: 2 });
  } else {
    const wallet = await walletFor(rule.wallet);
    legs.push({
      walletId: wallet.id,
      deltaCents: rule.direction === 'credit' ? amount : -amount,
      seq: 1,
    });
  }

  // --- 3. barreira de idempotência ---------------------------------------
  const operationId = newId();
  const { operation, inserted } = await insertOperation(client, {
    id: operationId,
    playerId: input.playerId,
    source: input.source,
    referenceId: input.referenceId,
    reason: input.reason,
  });

  // --- 4. retentativa -----------------------------------------------------
  if (!inserted) {
    if (operation.playerId !== input.playerId) {
      // A mesma referência externa sendo aplicada a outro jogador é sinal de
      // erro no emissor ou de tentativa de reaproveitar uma referência. Nunca
      // deve passar em silêncio.
      throw conflict(
        'REFERENCE_BELONGS_TO_ANOTHER_PLAYER',
        'Esta referência já pertence a uma operação de outro jogador.',
      );
    }
    return {
      operationId: operation.id,
      entries: await listEntriesByOperation(client, operation.id),
      applied: false,
    };
  }

  // --- 5. deltas, em ordem determinística de carteira ----------------------
  // Bloqueio sempre por walletId crescente, qualquer que seja a direção
  // lógica: assim uma transferência A→B e outra B→A concorrentes tomam os
  // locks na mesma sequência e não travam em deadlock (ADR 0002, D10).
  //
  // A ordem de bloqueio e a ordem do extrato são coisas diferentes: o `seq` de
  // cada perna já foi fixado pela semântica (origem antes de destino) e não
  // muda por causa da ordenação de lock.
  const byWalletId = [...legs].sort((a, b) => a.walletId.localeCompare(b.walletId));

  const balances = new Map<number, Cents>();
  for (const leg of byWalletId) {
    const balanceAfter = await applyBalanceDelta(client, leg.walletId, leg.deltaCents);
    if (balanceAfter === null) {
      // Nenhuma linha retornada = a condição `saldo + delta >= 0` falhou.
      // Lançar aqui aborta a transação inteira: a operação registrada no passo
      // 3 desaparece junto. Não existe operação parcialmente aplicada.
      throw unprocessable('INSUFFICIENT_FUNDS', 'Saldo insuficiente para esta operação.');
    }
    balances.set(leg.seq, balanceAfter);
  }

  // --- 6. lançamentos, em ordem semântica ---------------------------------
  const ordered = [...legs].sort((a, b) => a.seq - b.seq);
  for (const leg of ordered) {
    const balanceAfter = balances.get(leg.seq);
    if (balanceAfter === undefined) throw new Error('Saldo pós-lançamento ausente');
    await insertEntry(client, {
      id: newId(),
      operationId: operation.id,
      walletId: leg.walletId,
      seq: leg.seq,
      amountCents: leg.deltaCents,
      balanceAfterCents: balanceAfter,
    });
  }

  // --- 7. invariantes -----------------------------------------------------
  if (rule.direction === 'transfer') {
    const total = legs.reduce((acc, leg) => acc + leg.deltaCents, 0);
    if (total !== 0) {
      // Transferência interna não cria nem destrói dinheiro (ADR 0001, Ajuste B).
      throw new Error(`Transferência com soma ${total}, esperado 0`);
    }
  }

  return {
    operationId: operation.id,
    entries: await listEntriesByOperation(client, operation.id),
    applied: true,
  };
}

/**
 * Crédito interno. Açúcar sobre `postOperation` — a carteira continua vindo da
 * matriz, não do chamador.
 */
export const credit = postOperation;

/** Débito interno. Recusa deixar CASH negativo, atomicamente. */
export const debit = postOperation;

/** Transferência interna entre carteiras do mesmo jogador, duas pernas. */
export const transfer = postOperation;
