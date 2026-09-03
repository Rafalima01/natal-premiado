import type { CSSProperties } from 'react';
import { cx } from '@/lib/format';

interface CoinProps {
  /** símbolo estampado na moeda */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/** Moeda dourada com bisel, usada solta no hero e nos contadores. */
export function Coin({ label = 'R$', className, style }: CoinProps) {
  return (
    <svg viewBox="0 0 100 100" className={cx('overflow-visible', className)} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="coin-face" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="30%" stopColor="#ffd45e" />
          <stop offset="62%" stopColor="#ffc531" />
          <stop offset="100%" stopColor="#b3760a" />
        </linearGradient>
        <linearGradient id="coin-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe89a" />
          <stop offset="50%" stopColor="#d99205" />
          <stop offset="100%" stopColor="#8a5a02" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="52" r="46" fill="#7a4d02" opacity="0.55" />
      <circle cx="50" cy="50" r="46" fill="url(#coin-rim)" />
      <circle cx="50" cy="50" r="37" fill="url(#coin-face)" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="#a86c04" strokeOpacity="0.5" strokeWidth="2" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Fredoka, sans-serif"
        fontSize="30"
        fontWeight="600"
        fill="#8a5a02"
      >
        {label}
      </text>
      {/* brilho */}
      <ellipse cx="36" cy="28" rx="14" ry="8" fill="#fff" opacity="0.55" transform="rotate(-32 36 28)" />
    </svg>
  );
}
