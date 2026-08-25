import { winners } from '@/data/winners';
import { accentStyle } from '@/lib/accents';
import { moneyShort, timeAgo } from '@/lib/format';

function WinPill({ winner, clone }: { winner: (typeof winners)[number]; clone?: boolean }) {
  return (
    <li
      aria-hidden={clone ? true : undefined}
      style={accentStyle(winner.accent)}
      className="edge group/win flex w-[16.5rem] shrink-0 items-center gap-3 rounded-lg bg-linear-to-r from-surface-2/90 to-surface/80 px-3 py-2.5 transition-colors duration-300 hover:from-surface-3/90"
    >
      <span
        aria-hidden="true"
        className="relative grid size-11 shrink-0 place-items-center rounded-md text-[1.3rem]"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--a-mid) 45%, transparent), transparent), linear-gradient(160deg, #2a1019, #150710)',
          boxShadow: '0 0 18px -6px var(--a-glow), inset 0 0 0 1px rgba(255,255,255,.08)',
        }}
      >
        {winner.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[0.78rem] font-medium text-muted">{winner.name}</span>
          <span className="shrink-0 text-[0.66rem] text-dim">{timeAgo(winner.minutesAgo)}</span>
        </span>
        <span className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className="truncate text-[0.85rem] font-semibold text-text">{winner.prize}</span>
          <span className="price-chip shrink-0 text-[0.9rem] text-gold-grad">
            {moneyShort(winner.value)}
          </span>
        </span>
      </span>
    </li>
  );
}

/**
 * Faixa de ganhadores em movimento contínuo. A lista é duplicada e o trilho
 * anda -50% — a emenda fica invisível. `animate-marquee` só usa transform.
 */
export function RecentWins() {
  return (
    <section aria-labelledby="ganhadores-recentes" className="relative py-6 sm:py-8">
      <div className="np-container">
        <div className="edge edge-gold relative overflow-hidden rounded-xl bg-bg-deep/70 backdrop-blur-md">
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4">
            {/* ---------- rótulo ao vivo ---------- */}
            <h2
              id="ganhadores-recentes"
              className="flex shrink-0 items-center gap-2.5 px-1 sm:px-2"
            >
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
              </span>
              <span className="font-display text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-text">
                <span aria-hidden="true" className="mr-1.5">
                  🎁
                </span>
                Ganhadores recentes
              </span>
            </h2>

            {/* ---------- trilho ---------- */}
            <div className="relative min-w-0 flex-1 overflow-hidden mask-fade-x">
              <ul className="flex w-max gap-3 animate-marquee hover:[animation-play-state:paused]">
                {winners.map((winner) => (
                  <WinPill key={winner.id} winner={winner} />
                ))}
                {/* segunda cópia, apenas visual */}
                {winners.map((winner) => (
                  <WinPill key={`${winner.id}-clone`} winner={winner} clone />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
