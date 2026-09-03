import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '@/lib/format';

const bulbColors = ['#ff4d5e', '#ffc531', '#2fd483', '#56b8f0', '#ff5fa2'];

interface LightStringProps {
  count?: number;
  className?: string;
}

/**
 * Cordão de luzes de Natal em CSS puro (sem imagem).
 * Usado no topo do header e como acabamento de seções.
 */
export function LightString({ count = 22, className }: LightStringProps) {
  const bulbs = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        key: index,
        color: bulbColors[index % bulbColors.length],
        delay: `${(index % 5) * 0.28}s`,
        /** alterna a altura para simular o fio pendurado */
        drop: index % 2 === 0 ? 0 : 3,
      })),
    [count],
  );

  return (
    // sem utilitário de `position` aqui: quem posiciona é quem usa
    // (passar `relative` na base venceria o `absolute` do className).
    <div aria-hidden="true" className={cx('light-string h-3 w-full', className)}>
      {/* fio */}
      <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/22 to-transparent" />
      {bulbs.map((bulb) => (
        <span
          key={bulb.key}
          className="light-bulb"
          style={
            {
              color: bulb.color,
              background: `linear-gradient(180deg, ${bulb.color}, color-mix(in oklab, ${bulb.color} 55%, black))`,
              marginTop: `${bulb.drop}px`,
              '--delay': bulb.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
