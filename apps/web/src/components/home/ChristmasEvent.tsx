import { EventProgress } from '@/components/gamification/EventProgress';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { LightString } from '@/components/ui/LightString';
import { player } from '@/data/gamification';
import { moneyCompact } from '@/lib/format';

/** 23 d 14 h 52 m 08 s em segundos — valor de vitrine. */
const EVENT_SECONDS = 23 * 86400 + 14 * 3600 + 52 * 60 + 8;

const perks = [
  { icon: '🎅', label: 'Raspadinhas exclusivas', detail: 'Só existem durante o evento' },
  { icon: '⚡', label: 'XP em dobro', detail: 'Todo dia até 25/12' },
  { icon: '🏆', label: 'Prêmio lendário', detail: 'Para quem coletar os 10' },
];

export function ChristmasEvent() {
  return (
    <section aria-labelledby="evento-de-natal-titulo" id="evento-de-natal" className="np-container scroll-mt-28 py-10 sm:py-14">
      <div className="edge edge-pine relative overflow-hidden rounded-2xl bg-linear-to-b from-pine-deep/45 via-bordo-deep/70 to-bg-deep shadow-e3">
        <LightString className="absolute inset-x-0 top-0 opacity-90" count={34} />

        {/* pinheiros geométricos ao fundo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-12"
          style={{
            backgroundImage:
              'repeating-linear-gradient(122deg, transparent 0 58px, rgba(47,212,131,.55) 58px 60px), repeating-linear-gradient(-122deg, transparent 0 58px, rgba(47,212,131,.55) 58px 60px)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 size-80 -translate-x-1/2 rounded-full bg-pine/25 blur-3xl"
        />

        <div className="relative grid gap-10 p-6 pt-9 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:p-12">
          {/* ---------------- coluna esquerda ---------------- */}
          <div>
            <Badge tone="red" icon="🔴" pulse>
              Evento ao vivo
            </Badge>

            <h2
              id="evento-de-natal-titulo"
              className="mt-4 font-display text-display font-semibold text-snow-grad"
            >
              <span aria-hidden="true" className="mr-2">
                🎄
              </span>
              Evento de Natal
            </h2>

            <p className="mt-3 max-w-md text-[1rem] text-muted">
              Um presente novo por dia até a véspera. Colete todos e desbloqueie a cartela lendária
              do Noel.
            </p>

            <div className="mt-7">
              <p className="mb-3 font-display text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-gold">
                O Natal termina em
              </p>
              <Countdown seconds={EVENT_SECONDS} size="lg" />
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {perks.map((perk) => (
                <li
                  key={perk.label}
                  className="edge rounded-lg bg-white/5 p-3 transition-colors duration-300 hover:bg-white/9"
                >
                  <span aria-hidden="true" className="block text-[1.25rem]">
                    {perk.icon}
                  </span>
                  <span className="mt-1.5 block font-display text-[0.82rem] leading-tight font-semibold text-text">
                    {perk.label}
                  </span>
                  <span className="mt-0.5 block text-[0.72rem] leading-tight text-dim">
                    {perk.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- coluna direita ---------------- */}
          <div className="edge edge-gold flex flex-col justify-between gap-6 rounded-xl bg-black/35 p-5 backdrop-blur-sm sm:p-7">
            <EventProgress collected={player.giftsCollected} total={player.giftsTotal} />

            {/* prêmio final do calendário */}
            <div className="edge edge-gold flex items-center gap-4 rounded-lg bg-linear-to-r from-gold/14 to-transparent p-3.5">
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-md bg-linear-to-b from-gold-hi to-gold-deep text-[1.5rem] shadow-glow-gold"
              >
                🛷
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[0.92rem] font-semibold text-gold-hi">
                  Prêmio final: Trenó do Noel
                </span>
                <span className="block text-[0.78rem] text-muted">
                  Liberado no 10º presente — vale {moneyCompact(10000)}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-black/45 px-2.5 py-1 text-[0.68rem] font-semibold text-dim">
                7 restantes
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="gold" size="lg" icon="🎁" className="shine-auto sm:flex-1">
                Coletar presente de hoje
              </Button>
              <Button to="/raspadinha/noel-da-sorte" variant="ghost" size="lg" className="sm:flex-1">
                Cartela do evento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
