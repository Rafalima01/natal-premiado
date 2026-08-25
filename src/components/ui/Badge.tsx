import type { ReactNode } from 'react';
import type { BadgeTone } from '@/data/types';
import { badgeToneClass } from '@/lib/accents';
import { cx } from '@/lib/format';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'xs' | 'sm';
  pulse?: boolean;
  className?: string;
}

export function Badge({ tone = 'gold', icon, children, size = 'sm', pulse, className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full font-display font-semibold uppercase',
        'tracking-[0.07em] leading-none whitespace-nowrap',
        size === 'xs' ? 'px-2 py-1 text-[0.66rem]' : 'px-2.5 py-1.5 text-[0.68rem]',
        badgeToneClass[tone],
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className={cx('text-[1.05em]', pulse && 'animate-pulse-glow')}>
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

/** Chip discreto para metadados (categoria, raridade, contadores). */
export function Chip({
  children,
  icon,
  active,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] font-medium leading-none',
        active
          ? 'border-gold/55 bg-gold/14 text-gold-hi'
          : 'border-border bg-white/4 text-muted',
        className,
      )}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
