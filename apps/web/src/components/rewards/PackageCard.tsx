import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PrizeArt } from '@/components/art/PrizeArt';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import type { PackageBox } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { money, moneyCompact, cx } from '@/lib/format';

export function PackageCard({ box, className }: { box: PackageBox; className?: string }) {
  return (
    <article
      style={
        {
          ...accentStyle(box.accent),
          '--edge-color':
            'linear-gradient(150deg, var(--a-hi), color-mix(in oklab, var(--a-mid) 22%, transparent) 45%, var(--a-deep))',
        } as CSSProperties
      }
      className={cx(
        'edge group/card relative flex flex-col overflow-hidden rounded-xl bg-linear-to-b from-surface-2/95 to-surface/95 shadow-e2',
        'transition-[transform,box-shadow] duration-350 ease-[var(--ease-out-quint)]',
        'hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_var(--a-glow)] focus-within:-translate-y-1.5 active:translate-y-0',
        className,
      )}
    >
      <div className="relative">
        <PrizeArt
          icon={box.icon}
          accent={box.accent}
          image={box.image}
          alt={box.title}
          extras={box.itemsIcons}
          ratio="square"
          className="rounded-none"
        />

        {box.badge ? (
          <div className="absolute top-3 left-3 z-3">
            <Badge tone={box.badge.tone} icon={box.badge.icon} size="xs">
              {box.badge.label}
            </Badge>
          </div>
        ) : null}

        <span className="absolute right-3 bottom-3 z-3 rounded-full bg-black/60 px-2.5 py-1 font-display text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-gold-hi backdrop-blur-sm">
          até {moneyCompact(box.maxPrize)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-[1.05rem] leading-tight font-semibold text-text">
          {box.title}
        </h3>
        <p className="line-clamp-2 text-[0.8rem] leading-snug text-muted">{box.subtitle}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="price-chip text-[1.1rem] text-gold-grad">{money(box.price)}</span>
          <span className={cx(buttonClasses('gold', 'sm'), 'pointer-events-none')} aria-hidden="true">
            <span aria-hidden="true">📦</span>
            Abrir
          </span>
        </div>
      </div>

      <Link
        to="/pacotes"
        className="absolute inset-0 z-4 rounded-xl"
        aria-label={`Pacote ${box.title} — prêmios de até ${moneyCompact(box.maxPrize)}, por ${money(box.price)}`}
      />
    </article>
  );
}
