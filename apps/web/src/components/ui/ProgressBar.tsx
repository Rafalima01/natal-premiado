import type { Accent } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { cx } from '@/lib/format';

interface ProgressBarProps {
  value: number;
  max: number;
  accent?: Accent;
  size?: 'sm' | 'md' | 'lg';
  /** mostra o "cometa" que corre sobre a barra */
  sparkle?: boolean;
  label?: string;
  className?: string;
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' } as const;

export function ProgressBar({
  value,
  max,
  accent = 'gold',
  size = 'md',
  sparkle = true,
  label,
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      className={cx('relative w-full overflow-hidden rounded-full bg-black/45 ring-1 ring-white/8 ring-inset', heights[size], className)}
      style={accentStyle(accent)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="relative h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-quint)]"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--a-deep), var(--a-mid) 45%, var(--a-hi))',
          boxShadow: '0 0 14px -2px var(--a-glow), 0 1px 0 rgba(255,255,255,.35) inset',
        }}
      >
        {sparkle && pct > 6 ? (
          <span
            aria-hidden="true"
            className="absolute top-1/2 right-0.5 size-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,.8)] animate-pulse-glow"
          />
        ) : null}
      </div>
    </div>
  );
}
