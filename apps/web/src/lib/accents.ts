import type { CSSProperties } from 'react';
import type { Accent, BadgeTone, Rarity } from '@/data/types';

/**
 * Cada accent expõe 4 variáveis CSS consumidas por cards, artes e badges.
 * Assim um card inteiro muda de "família visual" trocando uma prop.
 */
interface AccentRamp {
  hi: string;
  mid: string;
  deep: string;
  /** cor do glow, já com alfa */
  glow: string;
}

export const accentRamps: Record<Accent, AccentRamp> = {
  gold: { hi: '#ffe07a', mid: '#ffc531', deep: '#8a5a02', glow: 'oklch(0.84 0.16 85 / 55%)' },
  red: { hi: '#ff7688', mid: '#e01b33', deep: '#6b0a1a', glow: 'oklch(0.6 0.23 20 / 55%)' },
  pine: { hi: '#5ef0a8', mid: '#2fd483', deep: '#0d4f31', glow: 'oklch(0.75 0.18 158 / 50%)' },
  ember: { hi: '#ffb37a', mid: '#ff7a2f', deep: '#8f3404', glow: 'oklch(0.72 0.18 48 / 55%)' },
  ice: { hi: '#c9ecff', mid: '#56b8f0', deep: '#0f4468', glow: 'oklch(0.75 0.13 232 / 50%)' },
  royal: { hi: '#c9b2ff', mid: '#8a63f5', deep: '#2b1868', glow: 'oklch(0.62 0.21 295 / 55%)' },
  candy: { hi: '#ffb9d6', mid: '#ff5fa2', deep: '#78103f', glow: 'oklch(0.7 0.21 350 / 55%)' },
};

/** Devolve as custom properties do accent para aplicar em `style`. */
export function accentStyle(accent: Accent): CSSProperties {
  const ramp = accentRamps[accent];
  return {
    '--a-hi': ramp.hi,
    '--a-mid': ramp.mid,
    '--a-deep': ramp.deep,
    '--a-glow': ramp.glow,
  } as CSSProperties;
}

export const badgeToneClass: Record<BadgeTone, string> = {
  gold: 'bg-linear-to-b from-gold-hi to-gold-deep text-bordo-deep shadow-glow-gold',
  red: 'bg-linear-to-b from-primary-hi to-primary-deep text-white shadow-glow-red',
  pine: 'bg-linear-to-b from-pine-hi to-pine-deep text-bordo-deep shadow-glow-pine',
  ember: 'bg-linear-to-b from-ember-hi to-ember text-bordo-deep shadow-e2',
  ice: 'bg-linear-to-b from-frost to-[#2b7fb8] text-bordo-deep shadow-e2',
  neutral: 'bg-surface-3 text-text-soft border border-border',
};

export const rarityMeta: Record<Rarity, { label: string; accent: Accent; stars: number }> = {
  comum: { label: 'Comum', accent: 'ice', stars: 1 },
  raro: { label: 'Raro', accent: 'royal', stars: 2 },
  'épico': { label: 'Épico', accent: 'candy', stars: 3 },
  'lendário': { label: 'Lendário', accent: 'gold', stars: 4 },
};
