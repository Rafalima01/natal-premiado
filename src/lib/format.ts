const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const brlWhole = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** R$ 2,00 — usado em preços. */
export const money = (value: number) => brl.format(value);

/** R$ 2.000 — usado em prêmio máximo e valores altos. */
export const moneyShort = (value: number) => brlWhole.format(value);

/** 12,5 mil / 80 mil — usado quando o número precisa caber em um selo. */
export function moneyCompact(value: number) {
  if (value >= 1000) {
    const thousands = value / 1000;
    const label = Number.isInteger(thousands)
      ? String(thousands)
      : thousands.toFixed(1).replace('.', ',');
    return `R$ ${label} mil`;
  }
  return brlWhole.format(value);
}

export const number = (value: number) => new Intl.NumberFormat('pt-BR').format(value);

export function timeAgo(minutes: number) {
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `há ${hours} h`;
}

/** Junta classes ignorando falsy — evita dependência de `clsx`. */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
