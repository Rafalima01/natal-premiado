import { ScratchGrid } from '@/components/scratch/ScratchGrid';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { scratchCards } from '@/data/scratchCards';
import { player } from '@/data/gamification';

export function ScratchSection() {
  return (
    <section aria-labelledby="raspadinhas" className="relative py-10 sm:py-14">
      {/* faixa de fundo para destacar a seção mais importante da home */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 bottom-10 -z-1"
        style={{
          background:
            'radial-gradient(60rem 26rem at 50% 0%, oklch(0.45 0.2 22 / 32%), transparent 70%)',
        }}
      />

      <div className="np-container">
        <SectionHeader
          id="raspadinhas"
          icon="🎟️"
          eyebrow="O coração da plataforma"
          title="Raspadinhas"
          subtitle="Escolha sua raspadinha e descubra seu prêmio. Cada cartela tem sua própria coleção — e um teto de prêmio diferente."
          action={{ label: 'Ver catálogo', href: '/raspadinhas' }}
        />

        <ScratchGrid cards={scratchCards.slice(0, 8)} playerLevel={player.level} />

        <div className="mt-8 flex justify-center">
          <Button to="/raspadinhas" variant="outline" size="lg" trailing="→">
            Ver todas as {scratchCards.length} raspadinhas
          </Button>
        </div>
      </div>
    </section>
  );
}
