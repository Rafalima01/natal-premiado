import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PrizeArt } from '@/components/art/PrizeArt';
import { ScratchCanvas } from '@/components/scratch/ScratchCanvas';
import { ScratchGrid } from '@/components/scratch/ScratchGrid';
import { Badge, Chip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { player } from '@/data/gamification';
import { getScratchCard, relatedScratchCards } from '@/data/scratchCards';
import { accentStyle, rarityMeta } from '@/lib/accents';
import { money, moneyCompact, moneyShort, cx } from '@/lib/format';

const howItWorks = [
  { icon: '🎟️', title: 'Escolha a cartela', text: 'Cada tema tem sua própria coleção de prêmios.' },
  { icon: '👆', title: 'Raspe a superfície', text: 'Dedo no celular, mouse no desktop.' },
  { icon: '🎁', title: 'Veja o que apareceu', text: 'Símbolos iguais mostram o prêmio da cartela.' },
  { icon: '⚡', title: 'Receba na hora', text: 'Prêmio em dinheiro vai direto para a carteira.' },
];

export function RaspadinhaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const card = id ? getScratchCard(id) : undefined;
  const [revealed, setRevealed] = useState(false);

  const related = useMemo(() => (id ? relatedScratchCards(id, 4) : []), [id]);

  // Grade fixa da demonstração: 3 símbolos iguais + preenchimento.
  const demoGrid = useMemo(() => {
    if (!card) return [];
    const top = card.prizes[card.prizes.length - 1];
    const filler = card.prizes.slice(0, Math.max(1, card.prizes.length - 1));
    const cells = [
      top.icon,
      filler[0]?.icon ?? '❄️',
      top.icon,
      filler[1]?.icon ?? '⭐',
      top.icon,
      filler[0]?.icon ?? '🎄',
      filler[2]?.icon ?? '🔔',
      filler[1]?.icon ?? '🧦',
      filler[0]?.icon ?? '🍬',
    ];
    return cells.map((icon, index) => ({ icon, key: index, winning: icon === top.icon }));
  }, [card]);

  if (!card) return <Navigate to="/raspadinhas" replace />;

  const locked = card.lockedAtLevel !== undefined && player.level < card.lockedAtLevel;
  const topPrize = card.prizes[card.prizes.length - 1];

  return (
    <>
      <PageHero
        eyebrow={card.tagline}
        title={card.title}
        icon={card.icon}
        subtitle={card.description}
        crumbs={[
          { label: 'Início', href: '/' },
          { label: 'Raspadinhas', href: '/raspadinhas' },
          { label: card.title },
        ]}
        aside={
          <div className="flex flex-wrap gap-2">
            {card.badge ? (
              <Badge tone={card.badge.tone} icon={card.badge.icon}>
                {card.badge.label}
              </Badge>
            ) : null}
            <Badge tone="gold" icon="🏆">
              até {moneyCompact(card.maxPrize)}
            </Badge>
          </div>
        }
      />

      <section className="np-container pb-14">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          {/* ---------------- área de jogo ---------------- */}
          <div
            style={accentStyle(card.accent)}
            className="edge edge-gold relative overflow-hidden rounded-2xl bg-linear-to-b from-surface-2/95 to-bg-deep p-4 shadow-e3 sm:p-6"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
              style={{ background: 'radial-gradient(closest-side, var(--a-glow), transparent 70%)' }}
            />

            <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-[1.15rem] font-semibold text-snow-grad">
                Raspe para descobrir
              </h2>
              <span className="flex flex-wrap items-center gap-2">
                <Chip icon="🎯">3 iguais = prêmio</Chip>
                <Chip icon="🧪">demonstração</Chip>
              </span>
            </div>

            {locked ? (
              <div className="relative grid min-h-[18rem] place-items-center rounded-xl border border-gold/25 bg-black/40 p-8 text-center">
                <div>
                  <span aria-hidden="true" className="block text-[2.6rem]">
                    🔒
                  </span>
                  <h3 className="mt-3 font-display text-[1.15rem] font-semibold text-gold-hi">
                    Sala VIP — nível {card.lockedAtLevel}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-muted">
                    Você está no nível {player.level}. Continue jogando as outras cartelas para
                    desbloquear a Christmas Gold.
                  </p>
                  <Button to="/raspadinhas" variant="outline" size="md" className="mt-5">
                    Escolher outra cartela
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ScratchCanvas onReveal={() => setRevealed(true)} className="relative">
                  <div
                    className="grid grid-cols-3 gap-2 rounded-xl p-3 sm:gap-3 sm:p-4"
                    style={{
                      background:
                        'radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--a-mid) 26%, transparent), transparent 70%), linear-gradient(170deg, #2a1019, #120510)',
                    }}
                  >
                    {demoGrid.map((cell) => (
                      <div
                        key={cell.key}
                        className={cx(
                          'grid aspect-square place-items-center rounded-lg border text-[clamp(1.6rem,5vw,2.4rem)]',
                          cell.winning
                            ? 'border-gold/60 bg-gold/12 shadow-glow-gold'
                            : 'border-white/8 bg-black/35',
                        )}
                      >
                        <span aria-hidden="true" className={cx(cell.winning && 'animate-bob')}>
                          {cell.icon}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScratchCanvas>

                {/* resultado da demonstração */}
                <div
                  className={cx(
                    'relative mt-4 overflow-hidden transition-[max-height,opacity] duration-600 ease-[var(--ease-out-quint)]',
                    revealed ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0',
                  )}
                  aria-live="polite"
                >
                  <div className="edge edge-gold flex flex-wrap items-center gap-4 rounded-xl bg-linear-to-r from-gold/16 to-transparent p-4">
                    <span
                      aria-hidden="true"
                      className="grid size-14 shrink-0 place-items-center rounded-lg bg-linear-to-b from-gold-hi to-gold-deep text-[1.7rem] shadow-glow-gold"
                    >
                      {topPrize.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[1.05rem] font-semibold text-gold-hi">
                        3 símbolos iguais — {topPrize.name}
                      </span>
                      <span className="block text-[0.82rem] text-muted">
                        Exemplo de combinação premiada. Nesta maquete o resultado é sempre o mesmo.
                      </span>
                    </span>
                    <Button to="/cadastro" variant="gold" size="sm" icon="🎁">
                      Jogar de verdade
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ---------------- painel de compra ---------------- */}
          <aside className="flex flex-col gap-4">
            <div className="edge relative overflow-hidden rounded-2xl bg-surface/80 shadow-e2">
              <PrizeArt
                icon={card.icon}
                accent={card.accent}
                image={card.image}
                alt={card.title}
                extras={card.prizes.slice(0, 4).map((prize) => prize.icon)}
                ratio="wide"
                still
                className="rounded-none"
              />

              <div className="p-5">
                <div className="flex items-end justify-between gap-4">
                  <span className="flex flex-col leading-none">
                    <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-dim">
                      preço por cartela
                    </span>
                    <span className="price-chip mt-1.5 text-[1.85rem] text-gold-grad">
                      {money(card.price)}
                    </span>
                  </span>
                  <span className="flex flex-col text-right leading-none">
                    <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-dim">
                      prêmio máximo
                    </span>
                    <span className="price-chip mt-1.5 text-[1.35rem] text-text">
                      {moneyShort(card.maxPrize)}
                    </span>
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <Button variant="gold" size="lg" block icon="🎟️" className="shine-auto" disabled={locked}>
                    Raspar agora
                  </Button>
                  <Button to="/cadastro" variant="ghost" size="md" block>
                    Criar conta e ganhar 100% de bônus
                  </Button>
                </div>

                <ul className="mt-5 grid gap-2 text-[0.8rem] text-muted">
                  {[
                    ['⚡', 'Prêmio em dinheiro cai na carteira na hora'],
                    ['📦', 'Prêmio físico entregue em todo o Brasil'],
                    ['🔁', 'Troque qualquer prêmio por saldo'],
                  ].map(([icon, text]) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <span aria-hidden="true">{icon}</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ---------- tabela de prêmios ---------- */}
            <div className="edge rounded-2xl bg-surface/70 p-5">
              <h2 className="mb-3.5 flex items-center gap-2 font-display text-[1.02rem] font-semibold text-text">
                <span aria-hidden="true">🏆</span> Prêmios desta cartela
              </h2>

              <ul className="grid gap-2">
                {[...card.prizes].reverse().map((prize) => {
                  const rarity = rarityMeta[prize.rarity];
                  return (
                    <li
                      key={prize.name}
                      style={accentStyle(rarity.accent)}
                      className="flex items-center gap-3 rounded-lg border border-border bg-white/3 px-3 py-2.5 transition-colors duration-300 hover:bg-white/7"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-md text-[1.1rem]"
                        style={{
                          background:
                            'linear-gradient(150deg, color-mix(in oklab, var(--a-mid) 40%, transparent), color-mix(in oklab, var(--a-deep) 60%, transparent))',
                        }}
                      >
                        {prize.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.88rem] font-medium text-text">
                          {prize.name}
                        </span>
                        <span className="text-[0.7rem] text-dim">
                          <span aria-hidden="true" className="mr-1 text-gold-hi">
                            {'★'.repeat(rarity.stars)}
                          </span>
                          {rarity.label}
                        </span>
                      </span>
                      <span className="price-chip shrink-0 text-[0.95rem] text-gold-grad">
                        {moneyShort(prize.value)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>

        {/* ---------------- como funciona ---------------- */}
        <div className="mt-12">
          <SectionHeader icon="🧭" title="Como funciona" align="left" />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <li key={step.title} className="edge relative rounded-xl bg-surface/70 p-5">
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-4 font-display text-[2.2rem] leading-none font-semibold text-white/6"
                >
                  {index + 1}
                </span>
                <span aria-hidden="true" className="block text-[1.6rem]">
                  {step.icon}
                </span>
                <h3 className="mt-2.5 font-display text-[1rem] font-semibold text-text">{step.title}</h3>
                <p className="mt-1 text-[0.84rem] leading-snug text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- relacionadas ---------------- */}
      <section className="np-container pb-16">
        <SectionHeader
          icon="🎄"
          title="Quem raspou essa, raspou essas"
          action={{ label: 'Ver catálogo', href: '/raspadinhas' }}
        />
        <ScratchGrid cards={related} playerLevel={player.level} />
      </section>
    </>
  );
}
