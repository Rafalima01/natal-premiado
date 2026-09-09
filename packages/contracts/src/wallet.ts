import type { Cents, Currency } from './money.js';

/**
 * Carteiras do jogador.
 *
 * Duas carteiras desde a Fase 3 (ADR 0002, D5): CASH é o saldo monetário
 * principal, BONUS é saldo promocional. Elas são separadas de propósito — as
 * regras de consumo, rollover e expiração do BONUS pertencem à Fase 8, e
 * somá-las em um "saldo total" persistido recriaria exatamente a mistura que a
 * separação existe para evitar.
 *
 * Se a interface precisar exibir um total, ele é calculado na apresentação,
 * com as parcelas visíveis. Nunca persistido, nunca devolvido como verdade.
 */

export const WALLET_KINDS = ['CASH', 'BONUS'] as const;
export type WalletKind = (typeof WALLET_KINDS)[number];

export const isWalletKind = (value: string): value is WalletKind =>
  (WALLET_KINDS as readonly string[]).includes(value);

/**
 * Carteiras garantidas para todo jogador, em ordem determinística.
 *
 * A ordem importa: o provisionamento insere as carteiras nesta sequência para
 * que duas transações concorrentes tomem os locks na mesma ordem e não travem
 * em deadlock (ADR 0002, D4).
 */
export const REQUIRED_WALLET_KINDS: readonly WalletKind[] = ['BONUS', 'CASH'];

/** Uma carteira, como a API a devolve. Saldo em centavos inteiros. */
export interface WalletBalance {
  kind: WalletKind;
  currency: Currency;
  balanceCents: Cents;
}

/**
 * Resposta de `GET /v1/me/wallets`.
 *
 * Deliberadamente sem campo de total: ver o comentário no topo deste arquivo.
 */
export interface WalletsResponse {
  wallets: WalletBalance[];
}
