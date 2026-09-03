import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Mission } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { cx } from '@/lib/format';

export function MissionCard({ mission, className }: { mission: Mission; className?: string }) {
  const complete = mission.done || mission.progress >= mission.goal;

  return (
    <li
      style={accentStyle(mission.accent)}
      className={cx(
        'edge relative flex items-start gap-3.5 overflow-hidden rounded-lg bg-linear-to-br from-surface-2/90 to-surface/85 p-4',
        'transition-[transform,box-shadow] duration-350 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_var(--a-glow)]',
        complete && 'border-pine/30',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-md text-[1.25rem]"
        style={{
          background:
            'linear-gradient(150deg, color-mix(in oklab, var(--a-mid) 45%, transparent), color-mix(in oklab, var(--a-deep) 65%, transparent))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.22), 0 8px 18px -10px var(--a-glow)',
        }}
      >
        {complete ? '✅' : mission.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cx(
              'font-display text-[0.95rem] leading-tight font-semibold',
              complete ? 'text-pine-hi line-through decoration-pine/40' : 'text-text',
            )}
          >
            {mission.title}
          </h3>
          <span
            className={cx(
              'shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold whitespace-nowrap',
              complete ? 'bg-pine/20 text-pine-hi' : 'bg-gold/14 text-gold-hi',
            )}
          >
            {mission.reward}
          </span>
        </div>

        <p className="mt-1 text-[0.79rem] leading-snug text-dim">{mission.description}</p>

        <div className="mt-3 flex items-center gap-3">
          <ProgressBar
            value={mission.progress}
            max={mission.goal}
            accent={complete ? 'pine' : mission.accent}
            size="sm"
            sparkle={false}
            label={mission.title}
          />
          <span className="shrink-0 text-[0.72rem] font-semibold text-muted tnum">
            {Math.min(mission.progress, mission.goal)}/{mission.goal}
          </span>
        </div>
      </div>
    </li>
  );
}
