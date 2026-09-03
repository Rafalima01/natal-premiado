import type { CSSProperties } from 'react';
import { PrizeArt } from '@/components/art/PrizeArt';
import type { Prize } from '@/data/types';
import { accentStyle, rarityMeta } from '@/lib/accents';
import { moneyShort, cx } from '@/lib/format';

export function PrizeCard({ prize, className }: { prize: Prize; className?: string }) {
  const rarity = rarityMeta[prize.rarity];

  return (
    <article
      style={
        {
          ...accentStyle(prize.accent),
          '--edge-color':
            'linear-gradient(150deg, var(--a-hi), color-mix(in oklab, var(--a-mid) 20%, transparent) 45%, var(--a-deep))',
        } as CSSProperties
      }
      className={cx(
        'edge group/card relative flex flex-col overflow-hidden rounded-lg bg-linear-to-b from-surface-2/95 to-surface/95 shadow-e2',
        'transition-[transform,box-shadow] duration-350 ease-[var(--ease-out-quint)]',
        'hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_var(--a-glow)]',
        className,
      )}
    >
      <div className="relative">
        <PrizeArt
          icon={prize.icon}
          accent={prize.accent}
          image={prize.image}
          alt={prize.name}
          ratio="square"
          className="rounded-none"
        />

        {/* selo de raridade em estrelas — não depende só de cor */}
        <span
          className="absolute top-2.5 left-2.5 z-3 flex items-center gap-1 rounded-full bg-black/62 px-2 py-1 text-[0.66rem] font-semibold text-text-soft backdrop-blur-sm"
          title={`Raridade: ${rarity.label}`}
        >
          <span aria-hidden="true" className="text-gold-hi">
            {'★'.repeat(rarity.stars)}
            <span className="text-white/25">{'★'.repeat(4 - rarity.stars)}</span>
          </span>
          {rarity.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 font-display text-[0.92rem] leading-tight font-semibold text-text">
          {prize.name}
        </h3>
        <span className="price-chip mt-auto pt-2 text-[1.05rem] text-gold-grad">
          {moneyShort(prize.value)}
        </span>
      </div>
    </article>
  );
}
