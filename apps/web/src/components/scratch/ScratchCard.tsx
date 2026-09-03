import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PrizeArt } from '@/components/art/PrizeArt';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import type { ScratchCard as ScratchCardModel } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { money, moneyCompact, cx } from '@/lib/format';

interface ScratchCardProps {
  card: ScratchCardModel;
  /** nível do jogador — abaixo do exigido, o card entra no estado bloqueado */
  playerLevel?: number;
  className?: string;
}

/**
 * O item colecionável da plataforma: moldura, selo, arte, teto de prêmio,
 * preço e CTA. Estados: default / hover / active / disabled (bloqueado).
 */
export function ScratchCard({ card, playerLevel = 99, className }: ScratchCardProps) {
  const locked = card.lockedAtLevel !== undefined && playerLevel < card.lockedAtLevel;
  const extras = card.prizes.slice(0, 3).map((prize) => prize.icon);

  return (
    <article
      style={
        {
          ...accentStyle(card.accent),
          '--edge-color':
            'linear-gradient(150deg, var(--a-hi), color-mix(in oklab, var(--a-mid) 22%, transparent) 45%, var(--a-deep))',
        } as CSSProperties
      }
      className={cx(
        // @container: o card se adapta à própria largura (grade de 2 colunas
        // no mobile x trilho x grade de 4 no desktop), não à da janela.
        '@container edge group/card relative flex flex-col overflow-hidden rounded-xl',
        'bg-linear-to-b from-surface-2/95 to-surface/95 shadow-e2',
        'transition-[transform,box-shadow] duration-350 ease-[var(--ease-out-quint)]',
        'focus-within:-translate-y-1.5 focus-within:shadow-[0_28px_60px_-24px_var(--a-glow)]',
        locked
          ? 'opacity-72 saturate-50'
          : 'hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_var(--a-glow)] active:translate-y-0 active:scale-[0.99]',
        className,
      )}
    >
      {/* ---------- arte ---------- */}
      <div className="relative">
        <PrizeArt
          icon={card.icon}
          accent={card.accent}
          image={card.image}
          alt={card.title}
          extras={extras}
          ratio="wide"
          still={locked}
          className="rounded-none"
        />

        {/* selo principal */}
        {card.badge ? (
          <div className="absolute top-2.5 left-2.5 z-3 max-w-[calc(100%-1.25rem)] @min-[15rem]:top-3 @min-[15rem]:left-3">
            <Badge tone={card.badge.tone} icon={card.badge.icon} size="xs" pulse className="max-w-full">
              <span className="min-w-0 truncate">{card.badge.label}</span>
            </Badge>
          </div>
        ) : null}

        {/* marcador de "em alta" — só quando o card tem largura para ele */}
        {card.hot && !locked ? (
          <span
            className="absolute top-3 right-3 z-3 hidden items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[0.66rem] font-semibold text-ember-hi backdrop-blur-sm @min-[16rem]:flex"
            title="Muito jogada nas últimas horas"
          >
            <span aria-hidden="true" className="animate-pulse-glow">
              🔥
            </span>
            em alta
          </span>
        ) : null}

        {/* teto de prêmio, ancorado na arte */}
        <div className="absolute inset-x-0 bottom-0 z-3 flex items-end justify-between gap-2 p-2.5 @min-[15rem]:p-3">
          <span className="rounded-full bg-black/60 px-2.5 py-1 font-display text-[0.68rem] font-semibold whitespace-nowrap uppercase tracking-[0.08em] text-gold-hi backdrop-blur-sm">
            até {moneyCompact(card.maxPrize)}
          </span>
          <span className="hidden -space-x-1.5 @min-[14rem]:flex" aria-hidden="true">
            {card.prizes.slice(0, 3).map((prize, index) => (
              <span
                key={prize.name}
                className="grid size-6 place-items-center rounded-full border border-white/15 bg-bg-deep/85 text-[0.7rem] shadow-e1"
                style={{ zIndex: 3 - index }}
              >
                {prize.icon}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* ---------- conteúdo ---------- */}
      <div className="flex flex-1 flex-col gap-1 p-3 @min-[15rem]:p-4">
        <h3 className="font-display text-[1.02rem] leading-tight font-semibold text-text @min-[15rem]:text-[1.08rem]">
          {card.title}
        </h3>
        <p className="line-clamp-2 text-[0.82rem] leading-snug text-muted">{card.tagline}</p>

        {/* empilha em cards estreitos, vira linha quando há espaço */}
        <div className="mt-auto flex flex-col items-stretch gap-2 pt-3 @min-[15rem]:flex-row @min-[15rem]:items-center @min-[15rem]:justify-between @min-[15rem]:gap-3">
          <span className="flex flex-col leading-none">
            <span className="text-[0.66rem] font-semibold whitespace-nowrap uppercase tracking-[0.12em] text-dim">
              por apenas
            </span>
            <span className="price-chip mt-1 text-[1.15rem] text-gold-grad">{money(card.price)}</span>
          </span>

          <span
            className={cx(
              buttonClasses('gold', 'sm'),
              'pointer-events-none w-full @min-[15rem]:w-auto',
              locked && 'opacity-50 saturate-0',
            )}
            aria-hidden="true"
          >
            <span aria-hidden="true">🎟️</span>
            Jogar
          </span>
        </div>
      </div>

      {/* ---------- estado bloqueado ---------- */}
      {locked ? (
        <div className="absolute inset-0 z-5 grid place-items-center bg-bg-deep/55 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-gold/30 bg-bg-deep/85 px-5 py-4 text-center">
            <span aria-hidden="true" className="text-[1.6rem]">
              🔒
            </span>
            <span className="font-display text-[0.9rem] font-semibold text-gold-hi">
              Nível {card.lockedAtLevel} necessário
            </span>
            <span className="text-[0.75rem] text-muted">Continue jogando para desbloquear</span>
          </div>
        </div>
      ) : (
        /* link que cobre o card inteiro — 1 alvo, 1 rótulo, foco visível */
        <Link
          to={`/raspadinha/${card.id}`}
          className="absolute inset-0 z-4 rounded-xl"
          aria-label={`Jogar a raspadinha ${card.title}, prêmios de até ${moneyCompact(card.maxPrize)}, por ${money(card.price)}`}
        />
      )}
    </article>
  );
}
