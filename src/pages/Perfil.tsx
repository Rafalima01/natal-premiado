import { EventProgress } from '@/components/gamification/EventProgress';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { MissionCard } from '@/components/gamification/MissionCard';
import { XPBar } from '@/components/gamification/XPBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { levelTitles, missions, player, playerBadges, ranking } from '@/data/gamification';
import { winners } from '@/data/winners';
import { accentStyle } from '@/lib/accents';
import { money, moneyShort, number, timeAgo, cx } from '@/lib/format';

const stats = [
  { icon: '🎟️', label: 'Cartelas jogadas', value: '184' },
  { icon: '🏆', label: 'Prêmios ganhos', value: '27' },
  { icon: '🔥', label: 'Maior sequência', value: '9 dias' },
  { icon: '🎁', label: 'Presentes abertos', value: '12' },
];

const responsiblePlay = [
  { icon: '💰', title: 'Limite de depósito', value: 'R$ 300 / semana' },
  { icon: '⏱️', title: 'Limite de tempo', value: '2 h por dia' },
  { icon: '🛟', title: 'Autoexclusão', value: 'Desativada' },
];

export function Perfil() {
  return (
    <>
      <PageHero
        icon="👤"
        eyebrow="Conta de demonstração"
        title="Seu perfil"
        subtitle="Nível, conquistas, missões e histórico. Tudo o que aparece aqui é mock visual."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Perfil' }]}
        aside={
          <div className="flex gap-2">
            <Button to="/carteira" variant="ghost" size="sm" icon="👛">
              Carteira
            </Button>
            <Button to="/raspadinhas" variant="gold" size="sm" icon="🎟️">
              Jogar
            </Button>
          </div>
        }
      />

      <section className="np-container pb-16">
        {/* ---------------- cartão do jogador ---------------- */}
        <div className="edge edge-gold relative overflow-hidden rounded-2xl bg-linear-to-br from-bordo/55 via-surface-2 to-surface p-6 shadow-e3 sm:p-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-gold/22 blur-3xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,.6) 0.8px, transparent 1.6px)',
              backgroundSize: '38px 38px',
            }}
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center">
            <div className="flex items-center gap-5">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="grid size-20 place-items-center rounded-2xl bg-linear-to-br from-primary to-bordo-deep text-[2.2rem] shadow-e2 ring-1 ring-white/12 sm:size-24"
                >
                  🧑‍🎄
                </span>
                <LevelBadge level={player.level} size="sm" className="absolute -right-2.5 -bottom-2.5" />
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-[1.5rem] leading-tight font-semibold text-snow-grad">
                  {player.name}
                </h2>
                <p className="text-[0.88rem] text-muted">{player.handle}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="gold" size="xs" icon="👑">
                    {player.title}
                  </Badge>
                  <Badge tone="neutral" size="xs">
                    desde {player.memberSince}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 lg:max-w-xl lg:pl-8">
              <XPBar
                level={player.level}
                title={player.title}
                xp={player.xp}
                xpToNext={player.xpToNext}
              />
              <p className="mt-3 text-[0.8rem] text-dim">
                Próximo título:{' '}
                <strong className="font-semibold text-text-soft">
                  {levelTitles[Math.min(player.level, levelTitles.length - 1)]}
                </strong>
              </p>
            </div>
          </div>

          {/* ---------- números ---------- */}
          <dl className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-black/28 p-4">
                <dt className="flex items-center gap-2 text-[0.72rem] text-dim">
                  <span aria-hidden="true">{stat.icon}</span>
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-display text-[1.35rem] font-semibold text-gold-grad tnum">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------- conquistas + evento ---------------- */}
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <div className="edge rounded-xl bg-surface/70 p-6">
            <h2 className="mb-5 flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">🎖️</span> Conquistas
              <span className="ml-auto rounded-full bg-white/6 px-2.5 py-1 text-[0.7rem] font-normal text-muted">
                {playerBadges.filter((badge) => badge.unlocked).length}/{playerBadges.length}
              </span>
            </h2>

            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
              {playerBadges.map((badge) => (
                <li key={badge.id} className="text-center">
                  <span
                    style={{
                      ...accentStyle(badge.accent),
                      ...(badge.unlocked
                        ? {
                            background:
                              'linear-gradient(150deg, color-mix(in oklab, var(--a-mid) 42%, transparent), color-mix(in oklab, var(--a-deep) 62%, transparent))',
                            boxShadow: '0 8px 20px -10px var(--a-glow)',
                          }
                        : undefined),
                    }}
                    className={cx(
                      'grid aspect-square place-items-center rounded-lg text-[1.5rem] transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-108',
                      badge.unlocked
                        ? 'border border-white/12'
                        : 'border border-border bg-white/3 opacity-45 grayscale',
                    )}
                  >
                    {badge.unlocked ? badge.icon : '🔒'}
                  </span>
                  <span
                    className={cx(
                      'mt-1.5 block text-[0.68rem] leading-tight',
                      badge.unlocked ? 'text-text-soft' : 'text-dim',
                    )}
                  >
                    {badge.name}
                  </span>
                  <span className="sr-only">
                    {badge.unlocked ? 'desbloqueada' : `bloqueada — ${badge.hint}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="edge rounded-xl bg-surface/70 p-6">
            <h2 className="mb-5 flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">🎄</span> Evento de Natal
            </h2>
            <EventProgress collected={player.giftsCollected} total={player.giftsTotal} />
          </div>
        </div>

        {/* ---------------- missões ---------------- */}
        <div className="mt-12">
          <SectionHeader icon="🎯" title="Missões" subtitle="Complete para subir de nível mais rápido." />
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </ul>
        </div>

        {/* ---------------- histórico + ranking ---------------- */}
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="edge rounded-xl bg-surface/70 p-6">
            <h2 className="mb-5 flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">🧾</span> Seus últimos prêmios
            </h2>
            <ul className="divide-y divide-white/6">
              {winners.slice(0, 6).map((win) => (
                <li key={win.id} className="flex items-center gap-3.5 py-3">
                  <span
                    aria-hidden="true"
                    style={{
                      ...accentStyle(win.accent),
                      background:
                        'linear-gradient(150deg, color-mix(in oklab, var(--a-mid) 35%, transparent), color-mix(in oklab, var(--a-deep) 55%, transparent))',
                    }}
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-[1.1rem]"
                  >
                    {win.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9rem] font-medium text-text">
                      {win.prize}
                    </span>
                    <span className="text-[0.74rem] text-dim">{timeAgo(win.minutesAgo)}</span>
                  </span>
                  <span className="price-chip shrink-0 text-[0.95rem] text-gold-grad">
                    {moneyShort(win.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="edge rounded-xl bg-surface/70 p-6">
            <h2 className="mb-5 flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">🏅</span> Ranking
            </h2>
            <ol className="grid gap-1.5">
              {ranking.map((row) => (
                <li
                  key={row.position}
                  className={cx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5',
                    row.isPlayer ? 'edge edge-gold bg-gold/10' : 'bg-white/3',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-md bg-white/6 font-display text-[0.78rem] font-semibold text-muted"
                  >
                    {row.position}
                  </span>
                  <span
                    className={cx(
                      'min-w-0 flex-1 truncate text-[0.88rem]',
                      row.isPlayer ? 'font-semibold text-gold-hi' : 'text-text-soft',
                    )}
                  >
                    {row.name}
                  </span>
                  <span className="shrink-0 font-display text-[0.85rem] font-semibold text-gold-grad tnum">
                    {number(row.points)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ---------------- jogo responsável ---------------- */}
        <div className="mt-12">
          <SectionHeader
            icon="🛟"
            title="Jogo responsável"
            subtitle="Limites configuráveis. Nesta maquete os valores são apenas ilustrativos."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {responsiblePlay.map((item) => (
              <div key={item.title} className="edge flex items-center gap-4 rounded-xl bg-surface/70 p-5">
                <span aria-hidden="true" className="text-[1.6rem]">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[0.95rem] font-semibold text-text">
                    {item.title}
                  </span>
                  <span className="block text-[0.84rem] text-muted">{item.value}</span>
                </span>
                <button
                  type="button"
                  className="ml-auto shrink-0 rounded-full border border-border px-3 py-1.5 text-[0.76rem] font-semibold text-muted transition-colors duration-250 hover:border-gold/45 hover:text-gold-hi"
                >
                  Ajustar
                </button>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-lg border border-white/8 bg-white/4 p-4 text-[0.8rem] leading-relaxed text-dim">
            Saldo de demonstração: {money(player.balance)}. Jogos com prêmios podem causar
            dependência. Se o jogo deixou de ser diversão, procure ajuda e use os limites acima.
          </p>
        </div>
      </section>
    </>
  );
}
