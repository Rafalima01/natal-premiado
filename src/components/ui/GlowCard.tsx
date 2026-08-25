import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Accent } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { cx } from '@/lib/format';

interface GlowCardProps {
  accent?: Accent;
  to?: string;
  as?: 'div' | 'article' | 'li' | 'section';
  interactive?: boolean;
  edge?: 'default' | 'gold' | 'red' | 'pine' | 'accent';
  padded?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const edgeClass: Record<NonNullable<GlowCardProps['edge']>, string> = {
  default: '',
  gold: 'edge-gold',
  red: 'edge-red',
  pine: 'edge-pine',
  accent: '',
};

/**
 * Superfície base de toda a plataforma: vidro escuro + moldura em gradiente
 * + halo do accent que acende no hover. Sem lógica, só casca visual.
 */
export function GlowCard({
  accent = 'gold',
  to,
  as = 'div',
  interactive = false,
  edge = 'default',
  padded = true,
  className,
  style,
  children,
}: GlowCardProps) {
  const classes = cx(
    'edge group/card relative overflow-hidden rounded-xl bg-linear-to-b from-surface-2/90 to-surface/95',
    'shadow-e2 transition-[transform,box-shadow] duration-350 ease-[var(--ease-out-quint)]',
    edgeClass[edge],
    padded && 'p-5',
    interactive &&
      'cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_var(--a-glow)] ' +
        'focus-visible:-translate-y-1.5',
    className,
  );

  const merged: CSSProperties = { ...accentStyle(accent), ...style };
  if (edge === 'accent') {
    (merged as Record<string, string>)['--edge-color'] =
      'linear-gradient(150deg, var(--a-hi), color-mix(in oklab, var(--a-mid) 25%, transparent) 45%, var(--a-deep))';
  }

  const glow = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-1/3 left-1/2 z-0 h-[70%] w-[85%] -translate-x-1/2 rounded-[50%] opacity-40 blur-3xl transition-opacity duration-500 group-hover/card:opacity-75"
      style={{ background: 'radial-gradient(closest-side, var(--a-glow), transparent 72%)' }}
    />
  );

  if (to) {
    return (
      <Link to={to} className={classes} style={merged}>
        {glow}
        <span className="relative z-1 block">{children}</span>
      </Link>
    );
  }

  const Tag = as;
  return (
    <Tag className={classes} style={merged}>
      {glow}
      <div className="relative z-1">{children}</div>
    </Tag>
  );
}
