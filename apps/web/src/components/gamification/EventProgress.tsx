import { ProgressBar } from '@/components/ui/ProgressBar';
import { eventGifts } from '@/data/gamification';
import { cx } from '@/lib/format';

interface EventProgressProps {
  collected: number;
  total: number;
  className?: string;
}

/** Calendário do evento: 10 presentes, 3 coletados, 1 disponível hoje. */
export function EventProgress({ collected, total, className }: EventProgressProps) {
  return (
    <div className={cx('w-full', className)}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-[0.9rem] font-semibold text-text">
          <span aria-hidden="true" className="mr-1.5">
            🎁
          </span>
          {collected}/{total} presentes coletados
        </span>
        <span className="text-[0.76rem] text-dim">
          Complete os 10 e leve o prêmio lendário do evento
        </span>
      </div>

      <ProgressBar value={collected} max={total} accent="pine" size="lg" label="Presentes coletados" />

      <ul className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {eventGifts.map((gift) => (
          <li key={gift.day}>
            <div
              title={`Dia ${gift.day} — ${gift.reward}`}
              className={cx(
                'group relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border text-center transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-quint)]',
                gift.collected
                  ? 'border-pine/45 bg-pine/12'
                  : gift.today
                    ? 'border-gold/60 bg-gold/14 shadow-glow-gold hover:-translate-y-1'
                    : 'border-border bg-white/3 opacity-60',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'text-[1.05rem] leading-none transition-transform duration-300',
                  gift.today && 'animate-bob',
                )}
              >
                {gift.collected ? '✅' : gift.today ? '🎁' : '🔒'}
              </span>
              <span
                className={cx(
                  'font-display text-[0.66rem] font-semibold',
                  gift.today ? 'text-gold-hi' : gift.collected ? 'text-pine-hi' : 'text-dim',
                )}
              >
                {gift.day}
              </span>
              <span className="sr-only">
                Dia {gift.day}: {gift.reward} —{' '}
                {gift.collected ? 'coletado' : gift.today ? 'disponível hoje' : 'bloqueado'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
