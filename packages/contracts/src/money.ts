/**
 * Primitivas monetárias compartilhadas entre a API e o frontend.
 *
 * Regra fundacional (ADR 0001): dinheiro é sempre inteiro em centavos.
 * Nunca float, nunca decimal. R$ 50,00 é `5000`, não `50.0`.
 *
 * O tipo `Cents` é "branded": um `number` cru não é atribuível a ele sem passar
 * por `toCents`, então um valor em reais não vaza para dentro de uma função que
 * espera centavos sem que o compilador reclame.
 */

declare const centsBrand: unique symbol;

/** Valor monetário em centavos inteiros. */
export type Cents = number & { readonly [centsBrand]: true };

/** Moedas aceitas. A operação inicial é só BRL — a coluna existe para não
 *  travar multi-moeda no futuro, sem que nada de câmbio seja construído. */
export const CURRENCIES = ['BRL'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const isCurrency = (value: string): value is Currency =>
  (CURRENCIES as readonly string[]).includes(value);

/** Maior valor seguro. `Number.MAX_SAFE_INTEGER` em centavos é ~R$ 90 trilhões;
 *  o teto abaixo é bem menor de propósito, para que um erro de unidade
 *  (reais tratados como centavos, ou o inverso) estoure cedo. */
export const MAX_CENTS = 1_000_000_000_00; // R$ 1 bilhão

export class InvalidAmountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAmountError';
  }
}

/**
 * Converte um number para `Cents`, validando. Use na fronteira de entrada —
 * nunca faça `value as Cents` para pular a checagem.
 */
export function toCents(value: number): Cents {
  if (!Number.isInteger(value)) {
    throw new InvalidAmountError(`Valor monetário deve ser inteiro em centavos, recebido: ${value}`);
  }
  if (!Number.isFinite(value)) {
    throw new InvalidAmountError('Valor monetário deve ser finito');
  }
  if (Math.abs(value) > MAX_CENTS) {
    throw new InvalidAmountError(`Valor monetário fora do intervalo permitido: ${value}`);
  }
  return value as Cents;
}

/** `Cents` positivo — para operações de crédito, onde zero não faz sentido. */
export function toPositiveCents(value: number): Cents {
  const cents = toCents(value);
  if (cents <= 0) {
    throw new InvalidAmountError(`Valor deve ser positivo, recebido: ${value}`);
  }
  return cents;
}

/** Formata para exibição. A API devolve centavos; quem formata é a interface. */
export function formatCents(value: Cents, currency: Currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value / 100);
}
