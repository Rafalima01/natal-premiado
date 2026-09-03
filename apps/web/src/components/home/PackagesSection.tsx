import { PackageCard } from '@/components/rewards/PackageCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { packages } from '@/data/packages';

export function PackagesSection() {
  return (
    <section aria-labelledby="pacotes" className="np-container py-10 sm:py-14">
      <SectionHeader
        id="pacotes"
        icon="📦"
        eyebrow="Recompensa garantida"
        title="Pacotes de Natal"
        subtitle="Caixas temáticas em que sempre sai alguma coisa. Escolha o tema e veja o que estava embrulhado."
        action={{ label: 'Ver todos', href: '/pacotes' }}
      />

      <div className="rail no-scrollbar bleed lg:bleed-reset lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {packages.slice(0, 4).map((box) => (
          <PackageCard key={box.id} box={box} className="w-[15rem] sm:w-[16rem] lg:w-auto" />
        ))}
      </div>
    </section>
  );
}
