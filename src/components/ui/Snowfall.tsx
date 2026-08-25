import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '@/lib/format';

interface SnowfallProps {
  /** quantidade de flocos — mantenha baixo, cada floco é 1 nó no DOM */
  count?: number;
  className?: string;
}

/** PRNG determinístico: mesma neve a cada render, zero Math.random no corpo. */
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Camada de neve fixa em tela cheia. Anima só `transform`/`opacity`,
 * fica atrás de tudo e não intercepta ponteiro.
 */
export function Snowfall({ count = 26, className }: SnowfallProps) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const size = 2 + seeded(index, 1) * 5;
        return {
          key: index,
          style: {
            left: `${seeded(index, 2) * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${11 + seeded(index, 3) * 14}s`,
            animationDelay: `${-seeded(index, 4) * 22}s`,
            '--snow-drift': `${(seeded(index, 5) - 0.5) * 160}px`,
            '--snow-opacity': `${0.32 + seeded(index, 6) * 0.5}`,
            filter: size > 5 ? 'blur(1px)' : undefined,
          } as CSSProperties,
        };
      }),
    [count],
  );

  return (
    <div
      aria-hidden="true"
      className={cx('snow-layer pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
    >
      {flakes.map((flake) => (
        <span
          key={flake.key}
          className="absolute top-0 rounded-full bg-white will-change-transform"
          style={{ ...flake.style, animationName: 'snowfall', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }}
        />
      ))}
    </div>
  );
}
