import { ProgressBar } from '@/components/ui/ProgressBar';
import { LevelBadge } from './LevelBadge';
import { number, cx } from '@/lib/format';

interface XPBarProps {
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  compact?: boolean;
  className?: string;
}

export function XPBar({ level, title, xp, xpToNext, compact = false, className }: XPBarProps) {
  const remaining = Math.max(0, xpToNext - xp);

  return (
    <div className={cx('flex items-center gap-4', className)}>
      <LevelBadge level={level} size={compact ? 'sm' : 'md'} />

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="font-display text-[0.95rem] font-semibold text-text">
            {title}
            <span className="ml-2 text-[0.72rem] font-medium tracking-[0.1em] text-dim uppercase">
              nível {level}
            </span>
          </span>
          <span className="text-[0.78rem] text-muted tnum">
            <strong className="font-semibold text-gold-hi">{number(xp)}</strong>
            <span className="text-dim"> / {number(xpToNext)} XP</span>
          </span>
        </div>

        <ProgressBar
          value={xp}
          max={xpToNext}
          accent="gold"
          size={compact ? 'sm' : 'md'}
          label={`Progresso do nível ${level}`}
        />

        {compact ? null : (
          <p className="mt-2 text-[0.78rem] text-dim">
            Faltam <strong className="font-semibold text-text-soft tnum">{number(remaining)} XP</strong>{' '}
            para o nível {level + 1}.
          </p>
        )}
      </div>
    </div>
  );
}
