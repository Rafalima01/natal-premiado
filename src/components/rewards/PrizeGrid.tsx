import type { Prize } from '@/data/types';
import { cx } from '@/lib/format';
import { PrizeCard } from './PrizeCard';

export function PrizeGrid({ prizes, className }: { prizes: Prize[]; className?: string }) {
  if (!prizes.length) {
    return (
      <p className="edge rounded-xl bg-surface/60 p-10 text-center text-muted">
        <span aria-hidden="true" className="mb-3 block text-[2rem]">
          🎄
        </span>
        Nenhum prêmio nessa categoria por enquanto. Escolha outra e volte aqui.
      </p>
    );
  }

  return (
    <div
      className={cx(
        'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className,
      )}
    >
      {prizes.map((prize) => (
        <PrizeCard key={prize.id} prize={prize} />
      ))}
    </div>
  );
}
