import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { categories } from '@/data/categories';
import type { Category } from '@/data/types';
import { accentStyle } from '@/lib/accents';
import { cx } from '@/lib/format';

function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      to={`/raspadinhas?categoria=${category.id}`}
      style={accentStyle(category.accent)}
      className={cx(
        'edge group/card relative flex w-[9.5rem] shrink-0 flex-col items-center gap-2 overflow-hidden rounded-xl p-4 text-center',
        'bg-linear-to-b from-surface-2/90 to-surface/90 shadow-e2',
        'transition-[transform,box-shadow] duration-350 ease-[var(--ease-out-quint)]',
        'hover:-translate-y-1.5 hover:shadow-[0_24px_46px_-22px_var(--a-glow)] active:translate-y-0',
        'xl:w-auto',
      )}
    >
      {/* brilho de fundo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 left-1/2 size-24 -translate-x-1/2 rounded-full opacity-45 blur-2xl transition-opacity duration-500 group-hover/card:opacity-90"
        style={{ background: 'radial-gradient(closest-side, var(--a-glow), transparent 70%)' }}
      />

      {/* etiqueta de presente com o ícone */}
      <span
        aria-hidden="true"
        className="relative grid size-14 place-items-center rounded-lg text-[1.6rem] transition-transform duration-400 ease-[var(--ease-spring)] group-hover/card:-rotate-6 group-hover/card:scale-110"
        style={{
          background:
            'linear-gradient(150deg, color-mix(in oklab, var(--a-mid) 55%, transparent), color-mix(in oklab, var(--a-deep) 70%, transparent))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.28), 0 10px 22px -10px var(--a-glow)',
        }}
      >
        {category.icon}
        {/* furinho da etiqueta */}
        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-black/45" />
      </span>

      <span className="relative font-display text-[0.95rem] leading-tight font-semibold text-text">
        {category.name}
      </span>
      <span className="relative text-[0.72rem] leading-tight text-dim">{category.blurb}</span>

      <span
        className="relative mt-1 rounded-full border px-2 py-0.5 text-[0.66rem] font-semibold"
        style={{
          borderColor: 'color-mix(in oklab, var(--a-mid) 45%, transparent)',
          color: 'var(--a-hi)',
          background: 'color-mix(in oklab, var(--a-mid) 12%, transparent)',
        }}
      >
        {category.count} cartelas
      </span>
    </Link>
  );
}

export function CategoryGrid() {
  return (
    <section aria-labelledby="categorias" className="np-container py-10 sm:py-14">
      <SectionHeader
        id="categorias"
        icon="🧭"
        eyebrow="Escolha seu mundo"
        title="Categorias"
        subtitle="Cada categoria tem seu próprio time de prêmios. Comece pelo que você mais quer ganhar."
      />

      {/* trilho até lg, grade a partir de xl */}
      <div className="rail no-scrollbar bleed xl:bleed-reset xl:grid xl:grid-cols-5 xl:gap-4 xl:overflow-visible">
        {categories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}

        {/* décimo tile: atalho para o catálogo inteiro */}
        <Link
          to="/raspadinhas"
          className="edge edge-gold group/card relative flex w-[9.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-gold/8 p-4 text-center transition-[transform,background-color] duration-350 hover:-translate-y-1.5 hover:bg-gold/14 xl:w-auto"
        >
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full border border-gold/40 text-[1.4rem] text-gold transition-transform duration-400 ease-[var(--ease-spring)] group-hover/card:scale-110"
          >
            →
          </span>
          <span className="font-display text-[0.95rem] font-semibold text-gold-hi">Ver todas</span>
          <span className="text-[0.72rem] text-muted">O catálogo completo</span>
        </Link>
      </div>
    </section>
  );
}
