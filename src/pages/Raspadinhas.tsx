import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScratchGrid } from '@/components/scratch/ScratchGrid';
import { Chip } from '@/components/ui/Badge';
import { PageHero } from '@/components/ui/PageHero';
import { categories } from '@/data/categories';
import { player } from '@/data/gamification';
import { scratchCards } from '@/data/scratchCards';
import { cx } from '@/lib/format';

type SortKey = 'destaque' | 'preco-asc' | 'preco-desc' | 'premio';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'destaque', label: 'Em destaque' },
  { key: 'preco-asc', label: 'Menor preço' },
  { key: 'preco-desc', label: 'Maior preço' },
  { key: 'premio', label: 'Maior prêmio' },
];

export function Raspadinhas() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('categoria') ?? 'todas';
  const [sort, setSort] = useState<SortKey>('destaque');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = scratchCards.filter((card) => {
      const byCategory = activeCategory === 'todas' || card.categories.includes(activeCategory);
      const bySearch =
        !term ||
        card.title.toLowerCase().includes(term) ||
        card.tagline.toLowerCase().includes(term) ||
        card.prizes.some((prize) => prize.name.toLowerCase().includes(term));
      return byCategory && bySearch;
    });

    const sorted = [...filtered];
    if (sort === 'preco-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'preco-desc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'premio') sorted.sort((a, b) => b.maxPrize - a.maxPrize);
    if (sort === 'destaque') sorted.sort((a, b) => Number(Boolean(b.hot)) - Number(Boolean(a.hot)));
    return sorted;
  }, [activeCategory, query, sort]);

  const selectCategory = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === 'todas') next.delete('categoria');
    else next.set('categoria', id);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHero
        icon="🎟️"
        eyebrow="Catálogo completo"
        title="Raspadinhas"
        subtitle="Escolha sua raspadinha e descubra seu prêmio. Cartelas a partir de R$ 1,00, com temas que vão de PIX na conta a relógio de luxo."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Raspadinhas' }]}
      />

      <section className="np-container pb-16">
        {/* ---------- filtros ---------- */}
        <div className="edge sticky top-[76px] z-30 mb-7 rounded-xl bg-bg-deep/85 p-3 backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* busca */}
              <div className="relative flex-1">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.95rem] text-dim"
                >
                  🔍
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por cartela ou prêmio…"
                  aria-label="Buscar raspadinhas"
                  className="h-11 w-full rounded-full border border-border bg-black/30 pr-4 pl-10 text-[0.9rem] text-text placeholder:text-dim transition-colors duration-250 focus:border-gold/50 focus:bg-black/45"
                />
              </div>

              {/* ordenação */}
              <div className="flex items-center gap-2">
                <label htmlFor="ordenar" className="shrink-0 text-[0.8rem] text-dim">
                  Ordenar
                </label>
                <select
                  id="ordenar"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="h-11 rounded-full border border-border bg-black/30 px-4 text-[0.85rem] font-medium text-text transition-colors duration-250 focus:border-gold/50"
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key} className="bg-surface text-text">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* categorias */}
            <div className="rail no-scrollbar gap-2 pb-0">
              <button type="button" onClick={() => selectCategory('todas')}>
                <Chip icon="✨" active={activeCategory === 'todas'}>
                  Todas
                </Chip>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  aria-pressed={activeCategory === category.id}
                >
                  <Chip icon={category.icon} active={activeCategory === category.id}>
                    {category.name}
                  </Chip>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- contagem ---------- */}
        <p className={cx('mb-4 text-[0.85rem] text-dim')} aria-live="polite">
          <strong className="font-semibold text-text-soft">{visible.length}</strong>{' '}
          {visible.length === 1 ? 'cartela encontrada' : 'cartelas encontradas'}
          {activeCategory !== 'todas'
            ? ` em ${categories.find((category) => category.id === activeCategory)?.name}`
            : ''}
        </p>

        {visible.length ? (
          <ScratchGrid cards={visible} playerLevel={player.level} />
        ) : (
          <div className="edge rounded-xl bg-surface/60 p-12 text-center">
            <span aria-hidden="true" className="mb-3 block text-[2.4rem]">
              🎅
            </span>
            <h2 className="font-display text-[1.15rem] font-semibold text-text">
              O Noel não achou nada aqui
            </h2>
            <p className="mt-2 text-[0.9rem] text-muted">
              Tente outro termo ou volte para todas as categorias.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                selectCategory('todas');
              }}
              className="mt-5 rounded-full border border-gold/45 bg-gold/10 px-5 py-2.5 text-[0.85rem] font-semibold text-gold-hi transition-colors duration-250 hover:bg-gold/18"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </>
  );
}
