import { PackageCard } from '@/components/rewards/PackageCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { packages } from '@/data/packages';

const steps = [
  { icon: '📦', title: 'Escolha a caixa', text: 'Cada tema tem sua lista de itens possíveis.' },
  { icon: '🎀', title: 'Abra o embrulho', text: 'A animação revela o que estava dentro.' },
  { icon: '🎁', title: 'Fique ou troque', text: 'Guarde o item ou converta em saldo na hora.' },
];

export function Pacotes() {
  return (
    <>
      <PageHero
        icon="📦"
        eyebrow="Recompensa garantida"
        title="Pacotes de Natal"
        subtitle="Caixas temáticas em que sempre sai alguma coisa. Escolha o tema, abra o embrulho e veja o que o Noel deixou."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Pacotes' }]}
        aside={
          <Badge tone="pine" icon="✅">
            Sempre sai prêmio
          </Badge>
        }
      />

      <section className="np-container pb-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {packages.map((box) => (
            <PackageCard key={box.id} box={box} />
          ))}
        </div>
      </section>

      <section className="np-container pb-16">
        <SectionHeader icon="🧭" title="Como abrir um pacote" />
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="edge relative overflow-hidden rounded-xl bg-surface/70 p-6">
              <span
                aria-hidden="true"
                className="absolute top-4 right-5 font-display text-[2.6rem] leading-none font-semibold text-white/6"
              >
                {index + 1}
              </span>
              <span aria-hidden="true" className="block text-[1.8rem]">
                {step.icon}
              </span>
              <h3 className="mt-3 font-display text-[1.05rem] font-semibold text-text">{step.title}</h3>
              <p className="mt-1.5 text-[0.88rem] leading-snug text-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center">
          <Button to="/cadastro" variant="gold" size="lg" icon="🎁" className="shine-auto">
            Criar conta e abrir a primeira caixa
          </Button>
        </div>
      </section>
    </>
  );
}
