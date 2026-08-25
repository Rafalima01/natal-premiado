import { SantaScene } from '@/components/art/SantaScene';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { scratchCards } from '@/data/scratchCards';
import { moneyCompact, number } from '@/lib/format';

const stats = [
  { value: `${scratchCards.length}`, label: 'raspadinhas no ar', icon: '🎟️' },
  { value: moneyCompact(80000), label: 'maior prêmio', icon: '🏆' },
  { value: `${number(12480)}+`, label: 'presentes entregues', icon: '🎁' },
];

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden pt-8 pb-4 sm:pt-12 lg:pt-16 lg:pb-10">
      {/* aurora do hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[42rem]"
        style={{
          background:
            'radial-gradient(48rem 30rem at 22% 30%, oklch(0.55 0.22 22 / 45%), transparent 65%), radial-gradient(38rem 26rem at 78% 22%, oklch(0.62 0.15 88 / 30%), transparent 65%)',
        }}
      />

      <div className="np-container relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* ---------------- lado esquerdo ---------------- */}
        <div className="relative z-2 text-center lg:text-left">
          <div className="rise flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <Badge tone="red" icon="🎄" pulse>
              Evento de Natal no ar
            </Badge>
            <Badge tone="pine" icon="⚡">
              Saque via PIX
            </Badge>
          </div>

          <h1 className="rise rise-1 mt-5 font-display text-hero font-semibold">
            <span className="block text-snow-grad">Seu Natal</span>
            <span className="block text-snow-grad">pode valer</span>
            {/* inline-block para o sublinhado ter exatamente a largura do texto */}
            <span className="relative inline-block text-gold-grad">
              muito mais
              {/* sublinhado de fita */}
              <svg
                aria-hidden="true"
                viewBox="0 0 420 22"
                className="absolute -bottom-1 left-0 h-3 w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 14c80-10 180-14 270-8 50 3 90 8 142 12"
                  fill="none"
                  stroke="url(#hero-underline)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="hero-underline" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#e01b33" />
                    <stop offset="55%" stopColor="#ffc531" />
                    <stop offset="100%" stopColor="#2fd483" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="rise rise-2 mx-auto mt-7 max-w-lg text-[1.02rem] leading-relaxed text-muted lg:mx-0 sm:text-[1.1rem]">
            Raspe, descubra seu prêmio e entre no clima do Natal. Cartelas a partir de{' '}
            <strong className="font-semibold text-gold-hi">R$ 1,00</strong>, prêmios que vão de PIX
            na conta a moto zero quilômetro.
          </p>

          <div className="rise rise-3 mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Button to="/raspadinhas" variant="gold" size="lg" icon="🎁" className="shine-auto">
              Raspar agora
            </Button>
            <Button to="/premios" variant="ghost" size="lg" trailing="→">
              Ver prêmios
            </Button>
          </div>

          {/* ---------- números ---------- */}
          <dl className="rise rise-4 mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 lg:mx-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="edge rounded-lg bg-white/4 px-3 py-3 text-center backdrop-blur-sm lg:text-left"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span aria-hidden="true" className="mb-1 block text-[1.05rem] lg:hidden">
                    {stat.icon}
                  </span>
                  <span className="block font-display text-[1.15rem] font-semibold text-gold-grad tnum sm:text-[1.3rem]">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-[0.68rem] leading-tight text-dim sm:text-[0.74rem]">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------- lado direito ---------------- */}
        <div className="relative z-1 order-first lg:order-none">
          <SantaScene className="animate-pop" />
        </div>
      </div>
    </section>
  );
}
