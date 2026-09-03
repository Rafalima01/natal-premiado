import { useMemo, useState } from 'react';
import { PrizeGrid } from '@/components/rewards/PrizeGrid';
import { Chip } from '@/components/ui/Badge';
import { PageHero } from '@/components/ui/PageHero';
import { categories } from '@/data/categories';
import { prizes, rarityOrder } from '@/data/prizes';
import { moneyCompact, number } from '@/lib/format';

const rarities = ['todas', 'lendário', 'épico', 'raro', 'comum'] as const;

export function Premios() {
  const [category, setCategory] = useState('todas');
  const [rarity, setRarity] = useState<(typeof rarities)[number]>('todas');

  const visible = useMemo(() => {
    return prizes
      .filter((prize) => category === 'todas' || prize.category === category)
      .filter((prize) => rarity === 'todas' || prize.rarity === rarity)
      .sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity] || b.value - a.value);
  }, [category, rarity]);

  const totalValue = prizes.reduce((sum, prize) => sum + prize.value, 0);

  return (
    <>
      <PageHero
        icon="🏆"
        eyebrow="Tudo que está embrulhado"
        title="Prêmios"
        subtitle="A vitrine completa do Natal Premiado. Do PIX de R$ 100 ao relógio suíço — tudo pode sair em uma cartela."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Prêmios' }]}
        aside={
          <div className="flex gap-3">
            {[
              { label: 'prêmios no catálogo', value: number(prizes.length) },
              { label: 'em prêmios', value: moneyCompact(totalValue) },
            ].map((stat) => (
              <div key={stat.label} className="edge rounded-lg bg-white/4 px-4 py-3 text-center">
                <span className="block font-display text-[1.25rem] font-semibold text-gold-grad tnum">
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-[0.7rem] text-dim">{stat.label}</span>
              </div>
            ))}
          </div>
        }
      />

      <section className="np-container pb-16">
        {/* ---------- filtros ---------- */}
        <div className="edge mb-7 flex flex-col gap-3 rounded-xl bg-bg-deep/70 p-3 backdrop-blur-md sm:p-4">
          <div className="rail no-scrollbar gap-2 pb-0">
            <button type="button" onClick={() => setCategory('todas')} aria-pressed={category === 'todas'}>
              <Chip icon="✨" active={category === 'todas'}>
                Todas as categorias
              </Chip>
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                aria-pressed={category === item.id}
              >
                <Chip icon={item.icon} active={category === item.id}>
                  {item.name}
                </Chip>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/6 pt-3">
            <span className="mr-1 text-[0.78rem] text-dim">Raridade:</span>
            {rarities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRarity(item)}
                aria-pressed={rarity === item}
              >
                <Chip active={rarity === item} icon={item === 'todas' ? undefined : '★'}>
                  <span className="capitalize">{item}</span>
                </Chip>
              </button>
            ))}
          </div>
        </div>

        <p className="mb-4 text-[0.85rem] text-dim" aria-live="polite">
          <strong className="font-semibold text-text-soft">{visible.length}</strong>{' '}
          {visible.length === 1 ? 'prêmio encontrado' : 'prêmios encontrados'}
        </p>

        <PrizeGrid prizes={visible} />
      </section>
    </>
  );
}
