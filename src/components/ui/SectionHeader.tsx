import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/lib/format';

interface SectionHeaderProps {
  icon?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: { label: string; href: string };
  align?: 'left' | 'center';
  id?: string;
  className?: string;
}

export function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
  id,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cx(
        'mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cx('min-w-0', align === 'center' && 'sm:max-w-2xl')}>
        {eyebrow ? (
          <p className="mb-2 flex items-center gap-2 font-display text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold">
            <span aria-hidden="true" className="h-px w-6 bg-linear-to-r from-gold to-transparent" />
            {eyebrow}
          </p>
        ) : null}

        <h2
          id={id}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-section font-semibold text-text"
        >
          {icon ? (
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-b from-white/12 to-white/2 text-[1.15rem] shadow-e1 ring-1 ring-white/10 sm:size-11"
            >
              {icon}
            </span>
          ) : null}
          <span className="text-snow-grad">{title}</span>
        </h2>

        {subtitle ? (
          <p className={cx('mt-2 max-w-2xl text-[0.95rem] text-muted', icon && 'sm:pl-14')}>{subtitle}</p>
        ) : null}
      </div>

      {action ? (
        <Link
          to={action.href}
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-white/4 px-4 py-2 text-[0.85rem] font-semibold text-text-soft transition-colors duration-250 hover:border-gold/50 hover:bg-gold/10 hover:text-gold-hi sm:self-auto"
        >
          {action.label}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      ) : null}
    </header>
  );
}
