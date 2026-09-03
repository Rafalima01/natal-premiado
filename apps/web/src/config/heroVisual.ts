/**
 * TESTE VISUAL DO HERO — troca apenas a arte do lado direito.
 *
 * Mude a constante abaixo para comparar as três versões. Nada mais no Hero
 * (texto, badges, botões, estatísticas, fundo, ganhadores) muda entre elas:
 * todas ocupam exatamente a mesma caixa de 544 x 586 px (ratio 0.929), que é
 * a área que a arte original já ocupava. Assim a altura do Hero fica idêntica
 * nas três e a comparação é justa.
 *
 *   'original'  -> composição em SVG (SantaScene) — a versão que já estava no ar
 *   'option-1'  -> Papai-noel.png  (render 3D, 1536x1024)
 *   'option-2'  -> santa-hero.png  (render 3D, 1200x1200)
 */
export type HeroVisualVariant = 'original' | 'option-1' | 'option-2';

export const HERO_VISUAL_VARIANT: HeroVisualVariant = 'original';

/** Proporção da caixa da arte. Vale para as três variantes — não mexer. */
export const HERO_STAGE_RATIO = '520 / 560';

export interface HeroImageVariant {
  src: string;
  alt: string;
  /** dimensões reais do arquivo (evita layout shift no carregamento) */
  width: number;
  height: number;
  /**
   * Ajuste fino do enquadramento. A arte entra com a largura da caixa e altura
   * automática, ou seja, sempre na proporção original — sem distorção e sem
   * corte. Estes valores só aproximam e reposicionam dentro da caixa.
   */
  scale: number;
  /** Deslocamento vertical em % da altura da arte (negativo = sobe). */
  offsetY: number;
  /** Deslocamento horizontal em % da largura da arte. */
  offsetX: number;
  /** Escala no mobile, onde a caixa é mais estreita. */
  scaleMobile: number;
  /**
   * Cada arquivo encosta o conteúdo em alguma borda (medido no alpha do PNG:
   * option-1 tem só 0,8% de margem no topo e 0% na base; option-2 tem 3,7% na
   * base). Estes valores dissolvem esses % para a arte não terminar em uma
   * linha reta sobre o fundo do Hero. As laterais já têm falloff suave no
   * próprio arquivo (9-10% na option-1, 17-22% na option-2).
   */
  topFade: number;
  bottomFade: number;
  /** Suaviza a subida abrupta do alpha nas laterais (0 = arquivo já resolve). */
  sideFade: number;
}

export const heroImageVariants: Record<Exclude<HeroVisualVariant, 'original'>, HeroImageVariant> = {
  'option-1': {
    src: '/assets/hero/variants/hero-option-1.webp',
    alt: 'Papai Noel de óculos escuros cercado de moedas douradas, presentes e uma cartela premiada',
    width: 1400,
    height: 933,
    scale: 1.2,
    offsetY: 0,
    offsetX: 0,
    scaleMobile: 1.14,
    topFade: 8,
    bottomFade: 9,
    sideFade: 9,
  },
  'option-2': {
    src: '/assets/hero/variants/hero-option-2.webp',
    alt: 'Papai Noel segurando uma caixa de presente dourada de onde saltam moedas',
    width: 1200,
    height: 1200,
    scale: 1.14,
    offsetY: 0,
    offsetX: 0,
    scaleMobile: 1,
    topFade: 0,
    bottomFade: 8,
    sideFade: 0,
  },
};
