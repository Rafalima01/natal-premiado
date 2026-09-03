import type { CSSProperties } from 'react';
import type { Accent } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { cx } from '@/lib/format';

interface PrizeArtProps {
  icon: string;
  accent: Accent;
  /** quando o asset final existir, ele entra aqui e substitui o desenho gerado */
  image?: string;
  alt?: string;
  /** ícones satélite que reforçam o tema da cartela */
  extras?: string[];
  ratio?: 'wide' | 'square' | 'tall';
  className?: string;
  /** desliga o efeito de aproximação no hover do card pai */
  still?: boolean;
}

const ratios = {
  wide: 'aspect-[16/10]',
  square: 'aspect-square',
  tall: 'aspect-[4/5]',
} as const;

/**
 * Painel de arte de um prêmio. Enquanto não há foto do produto, desenha uma
 * composição (raios + spotlight + ícone) que já respeita o accent do card.
 * Basta passar `image` para trocar pelo asset definitivo sem mexer no layout.
 */
export function PrizeArt({
  icon,
  accent,
  image,
  alt = '',
  extras,
  ratio = 'wide',
  className,
  still = false,
}: PrizeArtProps) {
  return (
    <div
      className={cx('relative overflow-hidden', ratios[ratio], className)}
      style={
        {
          ...accentStyle(accent),
          background:
            'radial-gradient(120% 90% at 50% 8%, color-mix(in oklab, var(--a-mid) 42%, transparent), transparent 70%), linear-gradient(170deg, #2a1019 0%, #170810 60%, #0d0407 100%)',
        } as CSSProperties
      }
    >
      {/* raios saindo do centro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% 46%, var(--a-hi) 0deg 5deg, transparent 5deg 16deg)',
          maskImage: 'radial-gradient(closest-side, #000 12%, transparent 74%)',
        }}
      />
      {/* poeira de estrelas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,.85) 0.7px, transparent 1.4px)',
          backgroundSize: '34px 34px',
        }}
      />
      {/* spotlight sob o produto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[18%] bottom-[8%] h-[26%] rounded-[50%] blur-lg"
        style={{ background: 'radial-gradient(closest-side, var(--a-glow), transparent 72%)' }}
      />

      {image ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cx(
            'absolute inset-0 size-full object-cover transition-transform duration-600 ease-[var(--ease-out-quint)]',
            !still && 'group-hover/card:scale-107',
          )}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span
            aria-hidden="true"
            className={cx(
              'select-none text-[clamp(2.6rem,8vw,4.2rem)] leading-none',
              'drop-shadow-[0_10px_22px_rgba(0,0,0,.6)]',
              'transition-transform duration-500 ease-[var(--ease-spring)]',
              !still && 'group-hover/card:-translate-y-1 group-hover/card:scale-110',
            )}
          >
            {icon}
          </span>
        </div>
      )}

      {/* satélites temáticos */}
      {extras?.length ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {extras.slice(0, 4).map((extra, index) => {
            const spots = [
              { top: '14%', left: '11%' },
              { top: '20%', right: '12%' },
              { bottom: '18%', left: '15%' },
              { bottom: '14%', right: '14%' },
            ][index];
            return (
              <span
                key={`${extra}-${index}`}
                className="absolute animate-bob text-[1.15rem] opacity-80 drop-shadow-[0_6px_10px_rgba(0,0,0,.5)]"
                style={{ ...spots, animationDelay: `${index * 0.6}s` }}
              >
                {extra}
              </span>
            );
          })}
        </div>
      ) : null}

      {/* neve acumulada na borda inferior + vinheta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 55%, rgba(13,4,7,.75) 100%), radial-gradient(120% 80% at 50% 120%, transparent 60%, rgba(0,0,0,.45) 100%)',
        }}
      />
    </div>
  );
}
