import { MissionCard } from '@/components/gamification/MissionCard';
import { XPBar } from '@/components/gamification/XPBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { missions, player, playerBadges, ranking } from '@/data/gamification';
import { accentStyle } from '@/lib/accents';
import { number, cx } from '@/lib/format';

function StreakFlames({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Sequência de ${days} dias`}>
      {Array.from({ length: 7 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cx(
            'grid size-6 place-items-center rounded-md text-[0.72rem] transition-colors duration-300',
            index < days
              ? 'bg-linear-to-b from-ember-hi to-ember text-bordo-deep shadow-[0_4px_12px_-4px_rgba(255,122,47,.8)]'
              : 'border border-border bg-white/4 text-dim',
          )}
        >
          {index < days ? '🔥' : index + 1}
        </span>
      ))}
    </div>
  );
}

export function GamificationPanel() {
  return (
    <section aria-labelledby="sua-jornada" className="np-container py-10 sm:py-14">
      <SectionHeader
        id="sua-jornada"
        icon="🎮"
        eyebrow="Progresso e recompensas"
        title="Sua jornada de Natal"
        subtitle="Cada cartela rende XP. Cada nível abre uma sala nova. Cada dia seguido aquece o combo."
        action={{ label: 'Abrir perfil', href: '/perfil' }}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------------- cartão do jogador ---------------- */}
        <div className="edge edge-gold relative flex flex-col gap-5 overflow-hidden rounded-xl bg-linear-to-br from-bordo/55 via-surface-2 to-surface p-5 shadow-e2 lg:row-span-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-gold/22 blur-3xl"
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[1.05rem] font-semibold text-text">Seu progresso</h3>
              <Badge tone="neutral" size="xs" icon="👤">
                demonstração
              </Badge>
            </div>

            <div className="mt-5">
              <XPBar
                level={player.level}
                title={player.title}
                xp={player.xp}
                xpToNext={player.xpToNext}
              />
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-black/25 p-3">
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dim">
                Moedas
              </span>
              <span className="mt-1 flex items-center gap-1.5 font-display text-[1.25rem] font-semibold text-gold-grad tnum">
                <span aria-hidden="true" className="text-[0.95rem]">
                  🪙
                </span>
                {number(player.coins)}
              </span>
            </div>
            <div className="rounded-lg border border-border bg-black/25 p-3">
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dim">
                Sequência
              </span>
              <span className="mt-1 flex items-baseline gap-1.5 font-display text-[1.25rem] font-semibold text-ember-hi tnum">
                {player.streak}
                <span className="text-[0.75rem] font-medium text-muted">dias</span>
              </span>
            </div>
          </div>

          <div className="relative">
            <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dim">
              Combo da semana
            </span>
            <StreakFlames days={player.streak} />
          </div>

          {/* ---------- badges ---------- */}
          <div className="relative">
            <span className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dim">
              Conquistas
            </span>
            <ul className="grid grid-cols-6 gap-2">
              {playerBadges.map((badge) => (
                <li key={badge.id}>
                  <span
                    title={`${badge.name} — ${badge.hint}`}
                    style={{
                      ...accentStyle(badge.accent),
                      ...(badge.unlocked
                        ? {
                            background:
                              'linear-gradient(150deg, color-mix(in oklab, var(--a-mid) 42%, transparent), color-mix(in oklab, var(--a-deep) 60%, transparent))',
                            boxShadow: '0 6px 16px -8px var(--a-glow)',
                          }
                        : undefined),
                    }}
                    className={cx(
                      'grid aspect-square place-items-center rounded-md text-[1.05rem] transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-110',
                      badge.unlocked
                        ? 'border border-white/12'
                        : 'border border-border bg-white/3 opacity-45 grayscale',
                    )}
                  >
                    {badge.unlocked ? badge.icon : '🔒'}
                    <span className="sr-only">
                      {badge.name}: {badge.unlocked ? 'desbloqueada' : `bloqueada — ${badge.hint}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button to="/perfil" variant="ghost" size="sm" block trailing="→" className="relative mt-auto">
            Ver todas as conquistas
          </Button>
        </div>

        {/* ---------------- missões ---------------- */}
        <div className="edge rounded-xl bg-surface/70 p-5 shadow-e2 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">🎯</span> Missões de hoje
            </h3>
            <span className="rounded-full bg-white/6 px-2.5 py-1 text-[0.7rem] text-muted">
              zera à meia-noite
            </span>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </ul>
        </div>

        {/* ---------------- ranking ---------------- */}
        <div className="edge rounded-xl bg-surface/70 p-5 shadow-e2 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">🏅</span> Ranking do evento
            </h3>
            <span className="rounded-full bg-white/6 px-2.5 py-1 text-[0.7rem] text-muted">
              atualiza toda segunda
            </span>
          </div>

          <ol className="grid gap-1.5">
            {ranking.map((row) => (
              <li
                key={row.position}
                style={accentStyle(row.accent)}
                className={cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-300',
                  row.isPlayer
                    ? 'edge edge-gold bg-gold/10'
                    : 'border border-transparent bg-white/3 hover:bg-white/6',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'grid size-7 shrink-0 place-items-center rounded-md font-display text-[0.78rem] font-semibold',
                    row.position === 1
                      ? 'bg-linear-to-b from-gold-hi to-gold-deep text-bordo-deep'
                      : row.position === 2
                        ? 'bg-linear-to-b from-white/80 to-white/40 text-bordo-deep'
                        : row.position === 3
                          ? 'bg-linear-to-b from-ember-hi to-ember text-bordo-deep'
                          : 'bg-white/6 text-muted',
                  )}
                >
                  {row.position}
                </span>

                <span
                  className={cx(
                    'min-w-0 flex-1 truncate text-[0.88rem] font-medium',
                    row.isPlayer ? 'text-gold-hi' : 'text-text-soft',
                  )}
                >
                  {row.name}
                </span>

                <span className="shrink-0 rounded-full bg-white/6 px-2 py-0.5 text-[0.68rem] text-muted">
                  nível {row.level}
                </span>
                <span className="shrink-0 font-display text-[0.88rem] font-semibold text-gold-grad tnum">
                  {number(row.points)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
