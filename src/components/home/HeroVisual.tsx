import type { CSSProperties } from 'react';
import { SantaScene } from '@/components/art/SantaScene';
import {
  HERO_STAGE_RATIO,
  HERO_VISUAL_VARIANT,
  heroImageVariants,
  type HeroVisualVariant,
} from '@/config/heroVisual';
import { cx } from '@/lib/format';

interface HeroVisualProps {
  /** força uma variante (a config define o padrão) */
  variant?: HeroVisualVariant;
  className?: string;
}

/**
 * Arte do lado direito do Hero. Só troca o conteúdo da caixa — a caixa em si
 * tem sempre a mesma largura e a mesma proporção (544 x 586), então o Hero não
 * muda de altura nem empurra o texto quando a variante muda.
 *
 * A imagem entra com largura da caixa e altura automática, ou seja, mantém a
 * proporção original: nada de stretch, nada de corte. O `scale` só aproxima ou
 * afasta a arte dentro dessa caixa.
 */
export function HeroVisual({ variant = HERO_VISUAL_VARIANT, className }: HeroVisualProps) {
  if (variant === 'original') {
    return <SantaScene className={className} />;
  }

  const art = heroImageVariants[variant];

  return (
    <div
      className={cx('relative mx-auto w-full max-w-[34rem]', className)}
      style={{ aspectRatio: HERO_STAGE_RATIO }}
    >
      {/* centraliza a arte na caixa sem alterar a caixa */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={art.src}
          alt={art.alt}
          width={art.width}
          height={art.height}
          /* acima da dobra: sem lazy, com prioridade de rede */
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="hero-art w-full drop-shadow-[0_30px_60px_rgba(0,0,0,.55)]"
          style={
            {
              '--art-scale': art.scale,
              '--art-scale-mobile': art.scaleMobile,
              '--art-x': `${art.offsetX}%`,
              '--art-y': `${art.offsetY}%`,
              '--art-fade-top': `${art.topFade}%`,
              '--art-fade-bottom': `${art.bottomFade}%`,
              '--art-fade-side': `${art.sideFade}%`,
            } as CSSProperties
          }
        />
      </div>
    </div>
  );
}
