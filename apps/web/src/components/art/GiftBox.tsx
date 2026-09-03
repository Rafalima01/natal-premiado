import type { CSSProperties } from 'react';
import type { Accent } from '@/data/types';
import { accentRamps } from '@/lib/accents';
import { cx } from '@/lib/format';

interface GiftBoxProps {
  accent?: Accent;
  /** levanta a tampa e acende o interior */
  open?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Caixa de presente em SVG com fita dourada, laço e brilho.
 * `open` levanta a tampa — é o único "estado" e serve só para o mock
 * do Presente do Dia.
 */
export function GiftBox({ accent = 'red', open = false, className, style }: GiftBoxProps) {
  const ramp = accentRamps[accent];
  const uid = `gift-${accent}`;

  return (
    <svg viewBox="0 0 200 200" className={cx('overflow-visible', className)} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={ramp.hi} />
          <stop offset="40%" stopColor={ramp.mid} />
          <stop offset="100%" stopColor={ramp.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={ramp.hi} />
          <stop offset="55%" stopColor={ramp.mid} />
          <stop offset="100%" stopColor={ramp.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-ribbon`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fff0bd" />
          <stop offset="38%" stopColor="#ffd45e" />
          <stop offset="72%" stopColor="#ffc531" />
          <stop offset="100%" stopColor="#a86c04" />
        </linearGradient>
        <radialGradient id={`${uid}-inner`} cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#fff8d6" />
          <stop offset="60%" stopColor="#ffc531" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffc531" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sombra no chão */}
      <ellipse cx="100" cy="186" rx="58" ry="10" fill="#000" opacity="0.42" />

      {/* luz saindo de dentro quando aberto */}
      {open ? <circle cx="100" cy="86" r="74" fill={`url(#${uid}-inner)`} /> : null}

      {/* corpo */}
      <rect x="38" y="86" width="124" height="86" rx="10" fill={`url(#${uid}-body)`} />
      <rect x="38" y="86" width="124" height="86" rx="10" fill="none" stroke="#000" strokeOpacity="0.22" />
      {/* face lateral mais escura, dá volume */}
      <path d="M132 86h20a10 10 0 0 1 10 10v66a10 10 0 0 1-10 10h-20z" fill="#000" opacity="0.2" />
      {/* fita vertical no corpo */}
      <rect x="88" y="86" width="24" height="86" fill={`url(#${uid}-ribbon)`} />

      {/* tampa */}
      <g
        style={{
          transformOrigin: '100px 86px',
          transform: open ? 'translateY(-26px) rotate(-9deg)' : 'none',
          transition: 'transform .55s var(--ease-spring)',
        }}
      >
        <rect x="28" y="62" width="144" height="30" rx="9" fill={`url(#${uid}-lid)`} />
        <rect x="28" y="62" width="144" height="30" rx="9" fill="none" stroke="#000" strokeOpacity="0.22" />
        <rect x="28" y="62" width="144" height="9" rx="4.5" fill="#fff" opacity="0.22" />
        <rect x="88" y="62" width="24" height="30" fill={`url(#${uid}-ribbon)`} />

        {/* laço */}
        <path
          d="M100 62c-9-2-24-8-27-18-2-8 4-14 11-11 8 4 14 15 16 29zM100 62c9-2 24-8 27-18 2-8-4-14-11-11-8 4-14 15-16 29z"
          fill={`url(#${uid}-ribbon)`}
          stroke="#8a5a02"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="100" cy="60" r="8" fill={`url(#${uid}-ribbon)`} stroke="#8a5a02" strokeWidth="1.4" />
      </g>

      {/* reflexo diagonal */}
      <path d="M52 172l44-86h16l-44 86z" fill="#fff" opacity="0.1" />
    </svg>
  );
}
