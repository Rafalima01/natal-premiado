import type { ScratchCard as ScratchCardModel } from '@/data/types';
import { cx } from '@/lib/format';
import { ScratchCard } from './ScratchCard';

interface ScratchGridProps {
  cards: ScratchCardModel[];
  playerLevel?: number;
  /** 'grid' empilha em colunas; 'rail' vira carrossel horizontal no mobile */
  layout?: 'grid' | 'rail';
  className?: string;
}

export function ScratchGrid({ cards, playerLevel, layout = 'grid', className }: ScratchGridProps) {
  if (layout === 'rail') {
    return (
      <div className={cx('rail no-scrollbar bleed lg:bleed-reset', className)}>
        {cards.map((card) => (
          <ScratchCard
            key={card.id}
            card={card}
            playerLevel={playerLevel}
            className="w-[16rem] sm:w-[18rem]"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cx(
        'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {cards.map((card) => (
        <ScratchCard key={card.id} card={card} playerLevel={playerLevel} />
      ))}
    </div>
  );
}
