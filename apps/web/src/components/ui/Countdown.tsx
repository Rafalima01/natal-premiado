import { Fragment } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { cx } from '@/lib/format';

interface CountdownProps {
  /** total inicial em segundos (mock) */
  seconds: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Dígitos fluidos: as células dividem a largura disponível e o número encolhe
 * junto, então o relógio cabe inteiro até em telas de 320px.
 */
const digitSize = {
  sm: 'text-[clamp(0.85rem,3.6vw,1.05rem)] py-1',
  md: 'text-[clamp(1.05rem,4.6vw,1.5rem)] py-1.5',
  lg: 'text-[clamp(1.35rem,7vw,2.5rem)] py-2',
} as const;

export function Countdown({ seconds, size = 'md', className }: CountdownProps) {
  const { days, hours, minutes, seconds: secs } = useCountdown(seconds);

  const cells = [
    { value: days, label: 'dias' },
    { value: hours, label: 'horas' },
    { value: minutes, label: 'min' },
    { value: secs, label: 'seg' },
  ];

  return (
    <div
      className={cx('flex w-full max-w-md items-stretch gap-1 sm:gap-2', className)}
      role="timer"
      aria-label={`Faltam ${days} dias, ${hours} horas, ${minutes} minutos e ${secs} segundos`}
    >
      {cells.map((cell, index) => (
        <Fragment key={cell.label}>
          <div
            className={cx(
              'edge edge-gold relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-md px-1',
              'bg-linear-to-b from-bordo to-bordo-deep shadow-e2',
              digitSize[size],
            )}
          >
            {/* vinco central de flip-clock */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/55"
            />
            <span className="font-display font-semibold leading-none text-gold-grad tnum">
              {pad(cell.value)}
            </span>
            <span className="mt-1 font-sans text-[0.66rem] leading-none font-semibold tracking-[0.1em] text-muted uppercase">
              {cell.label}
            </span>
          </div>

          {index < cells.length - 1 ? (
            <span
              aria-hidden="true"
              className="self-center font-display text-[1.1rem] leading-none text-gold/45"
            >
              :
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
