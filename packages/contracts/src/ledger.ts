import type { Cents, Currency } from './money.js';
import type { WalletKind } from './wallet.js';

/**
 * Matriz de razões financeiras.
 *
 * Esta é a peça que impede o cliente de decidir para onde o dinheiro vai. Uma
 * requisição como `{ "wallet": "CASH", "amount": 100000 }` não é confiável e
 * não existe rota que a aceite: o chamador informa um `reason`, e a plataforma
 * DERIVA daqui a carteira, a direção e as restrições (ADR 0002, D9 e P2).
 *
 * Nenhum reason tem, na Fase 3, uma origem pública: não há endpoint de
 * depósito, webhook, jogo ou ajuste administrativo. Os serviços internos
 * existem e são corretos; seu único consumidor nesta fase é a suíte de testes.
 * Isso é intencional — a fundação vem antes da porta.
 */

/** Origem de uma operação. Entra na chave de idempotência (ADR 0002, P1). */
export const LEDGER_SOURCES = ['platform', 'vertex', 'backoffice'] as const;
export type LedgerSource = (typeof LEDGER_SOURCES)[number];

export const isLedgerSource = (value: string): value is LedgerSource =>
  (LEDGER_SOURCES as readonly string[]).includes(value);

export const LEDGER_REASONS = [
  'deposit.settled',
  'adjustment.credit',
  'game.purchase',
  'prize.credit',
  'bonus.granted',
  'bonus.expired',
  'bonus.converted',
] as const;
export type LedgerReason = (typeof LEDGER_REASONS)[number];

export const isLedgerReason = (value: string): value is LedgerReason =>
  (LEDGER_REASONS as readonly string[]).includes(value);

/** Direção do lançamento na carteira. */
export type LedgerDirection = 'credit' | 'debit' | 'transfer';

/**
 * Fase em que o reason ganha uma origem capaz de acioná-lo.
 *
 * `structural` = a estrutura existe na Fase 3, mas nada em produção o dispara.
 * Registrado por reason para que ninguém precise adivinhar se um reason está
 * "pronto" só porque compila.
 */
export type ReasonAvailability = 'structural';

interface ReasonRuleBase {
  readonly reason: LedgerReason;
  /** Origens autorizadas a emitir este reason. */
  readonly sources: readonly LedgerSource[];
  readonly availability: ReasonAvailability;
  /** Por que existe e o que ainda falta. Documentação executável. */
  readonly note: string;
}

/** Movimento em uma única carteira. */
export interface SingleLegRule extends ReasonRuleBase {
  readonly direction: 'credit' | 'debit';
  readonly wallet: WalletKind;
}

/** Duas pernas, soma zero, mesmo jogador e mesma moeda (ADR 0001, Ajuste B). */
export interface TransferRule extends ReasonRuleBase {
  readonly direction: 'transfer';
  readonly from: WalletKind;
  readonly to: WalletKind;
}

export type LedgerReasonRule = SingleLegRule | TransferRule;

export const LEDGER_REASON_RULES: {
  readonly [R in LedgerReason]: Extract<LedgerReasonRule, { reason: R }> | LedgerReasonRule;
} = {
  'deposit.settled': {
    reason: 'deposit.settled',
    direction: 'credit',
    wallet: 'CASH',
    sources: ['vertex'],
    availability: 'structural',
    note: 'Aprovado no ADR 0001. Depende do contrato do Vertex (D5), bloqueado. Sem porta pública na Fase 3.',
  },
  'adjustment.credit': {
    reason: 'adjustment.credit',
    direction: 'credit',
    wallet: 'CASH',
    sources: ['backoffice'],
    availability: 'structural',
    note: 'Aprovado no ADR 0001. Depende de autenticação administrativa, que é outro projeto (D13). adjustment.debit NÃO foi aprovado e não existe aqui.',
  },
  'game.purchase': {
    reason: 'game.purchase',
    direction: 'debit',
    wallet: 'CASH',
    sources: ['platform'],
    availability: 'structural',
    note: 'Semântica depende da fase do jogo, ainda sem número atribuído.',
  },
  'prize.credit': {
    reason: 'prize.credit',
    direction: 'credit',
    wallet: 'CASH',
    sources: ['platform'],
    availability: 'structural',
    note: 'Idem game.purchase.',
  },
  'bonus.granted': {
    reason: 'bonus.granted',
    direction: 'credit',
    wallet: 'BONUS',
    sources: ['platform', 'backoffice'],
    availability: 'structural',
    note: 'Estrutura aprovada (ADR 0001, D4). Regras promocionais são da Fase 8.',
  },
  'bonus.expired': {
    reason: 'bonus.expired',
    direction: 'debit',
    wallet: 'BONUS',
    sources: ['platform'],
    availability: 'structural',
    note: 'Remoção de bônus por operação explícita e auditável, nunca por edição de saldo. Quando expira é da Fase 8.',
  },
  'bonus.converted': {
    reason: 'bonus.converted',
    direction: 'transfer',
    from: 'BONUS',
    to: 'CASH',
    sources: ['platform'],
    availability: 'structural',
    note: 'Mecanismo estrutural aprovado (ADR 0001, D4 e Ajuste B). As condições de conversão são da Fase 8.',
  },
};

/** Regra de um reason. Lança se o reason não existir na matriz. */
export function reasonRule(reason: LedgerReason): LedgerReasonRule {
  const rule = LEDGER_REASON_RULES[reason];
  if (!rule) throw new Error(`Reason fora da matriz: ${reason}`);
  return rule;
}

/** true quando a origem está autorizada a emitir aquele reason. */
export function isSourceAllowed(reason: LedgerReason, source: LedgerSource): boolean {
  return reasonRule(reason).sources.includes(source);
}

// --- Respostas da API -------------------------------------------------------

/**
 * Uma perna do extrato.
 *
 * `balanceAfterCents` vive AQUI, em cada lançamento — nunca no topo da
 * resposta (ADR 0002, D12). Em uma operação de duas pernas, um valor único no
 * nível da operação seria ambíguo ou simplesmente errado.
 */
export interface LedgerEntryResponse {
  entryId: string;
  operationId: string;
  seq: number;
  walletKind: WalletKind;
  currency: Currency;
  /** Com sinal: negativo é débito. */
  amountCents: Cents;
  balanceAfterCents: Cents;
  reason: LedgerReason;
  source: LedgerSource;
  createdAt: string;
}

/** Resposta paginada de `GET /v1/me/ledger`. Cursor, nunca offset. */
export interface LedgerPageResponse {
  entries: LedgerEntryResponse[];
  /** Opaco. Ausente quando não há mais páginas. */
  nextCursor: string | null;
}
