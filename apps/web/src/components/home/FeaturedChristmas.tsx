import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PrizeArt } from '@/components/art/PrizeArt';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { featured } from '@/data/featured';
import type { FeaturedCard } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { money, moneyCompact, cx } from '@/lib/format';

function FeatureCard({
  card,
  index,
  className,
}: {
  card: FeaturedCard;
  index: number;
  className?: string;
}) {
  return (
    <article
      style={
        {
          ...accentStyle(card.accent),
          '--edge-color':
            'linear-gradient(160deg, var(--a-hi), color-mix(in oklab, var(--a-mid) 30%, transparent) 42%, var(--a-deep))',
          animationDelay: `${index * 0.07}s`,
        } as CSSProperties
      }
      className={cx(
        'edge group/card relative flex flex-col overflow-hidden rounded-2xl',
        'bg-linear-to-b from-surface-2/95 via-surface/95 to-bg-deep shadow-e3',
        'transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-quint)]',
        'hover:-translate-y-2 hover:shadow-[0_34px_70px_-26px_var(--a-glow)]',
        'focus-within:-translate-y-2 active:translate-y-0',
        className,
      )}
    >
      {/* fita de canto */}
      {card.badge ? (
        <span
          className={cx(
            'ribbon',
            card.badge.tone === 'gold'
              ? 'bg-linear-to-r from-gold-hi to-gold-deep text-bordo-deep'
              : card.badge.tone === 'pine'
                ? 'bg-linear-to-r from-pine-hi to-pine-deep text-bordo-deep'
                : card.badge.tone === 'ember'
                  ? 'bg-linear-to-r from-ember-hi to-ember text-bordo-deep'
                  : 'bg-linear-to-r from-primary-hi to-primary-deep text-white',
          )}
        >
          {card.badge.label}
        </span>
      ) : null}

      <PrizeArt
        icon={card.icon}
        accent={card.accent}
        image={card.image}
        alt={card.title}
        ratio="tall"
        extras={['✦', '❄️', '🎁']}
        className="rounded-none"
      />

      {/* neve acumulada na emenda arte/conteúdo */}
      <span aria-hidden="true" className="relative -mt-2 block h-3 opacity-80">
        <span className="snowcap" />
      </span>

      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-3 pb-5">
        <p className="font-display text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold">
          {card.eyebrow}
        </p>
        <h3 className="font-display text-[1.4rem] leading-none font-semibold text-snow-grad">
          {card.title}
        </h3>

        <p className="mt-1 flex items-center gap-1.5">
          <Badge tone="gold" size="xs" icon="🏆">
            até {moneyCompact(card.maxPrize)}
          </Badge>
        </p>

        <p className="mt-1 line-clamp-3 text-[0.85rem] leading-snug text-muted">{card.blurb}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="flex flex-col leading-none">
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-dim">
              a partir de
            </span>
            <span className="price-chip mt-1 text-[1.2rem] text-gold-grad">{money(card.price)}</span>
          </span>
          <span className={cx(buttonClasses('festive', 'sm'), 'pointer-events-none')} aria-hidden="true">
            Jogar
          </span>
        </div>
      </div>

      <Link
        to={card.href}
        className="absolute inset-0 z-4 rounded-2xl"
        aria-label={`${card.title} — prêmios de até ${moneyCompact(card.maxPrize)}, a partir de ${money(card.price)}`}
      />
    </article>
  );
}

export function FeaturedChristmas() {
  return (
    <section aria-labelledby="destaques-de-natal" className="np-container py-10 sm:py-14">
      <SectionHeader
        id="destaques-de-natal"
        icon="🎄"
        eyebrow="Seleção do Noel"
        title="Destaques de Natal"
        subtitle="As cartelas que estão movimentando o evento. Cada uma com sua própria coleção de prêmios."
        action={{ label: 'Ver todas', href: '/raspadinhas' }}
      />

      {/* trilho no mobile (o card é alto demais para empilhar), grade a partir de sm */}
      <div className="rail no-scrollbar bleed sm:bleed-reset sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible xl:grid-cols-4">
        {featured.map((card, index) => (
          <FeatureCard key={card.id} card={card} index={index} className="w-[15.5rem] sm:w-auto" />
        ))}
      </div>
    </section>
  );
}
