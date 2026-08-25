import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { GiftBox } from '@/components/art/GiftBox';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cx } from '@/lib/format';

/** Prêmio fixo — o "sorteio" é só encenação, não há RNG nem persistência. */
const dailyReward = {
  icon: '🎟️',
  title: '1 raspadinha grátis',
  detail: 'Válida na PIX na Conta — some da carteira em 24 h.',
  extra: '+80 moedas de Natal',
};

const burstIcons = ['✦', '🎉', '💰', '❄️', '⭐', '🎁', '✧', '💫'];

export function DailyGift() {
  const [opened, setOpened] = useState(false);

  const burst = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = (index / 14) * Math.PI * 2;
        const distance = 90 + (index % 4) * 26;
        return {
          key: index,
          icon: burstIcons[index % burstIcons.length],
          style: {
            '--bx': `${Math.cos(angle) * distance}px`,
            '--by': `${Math.sin(angle) * distance - 40}px`,
            '--br': `${(index % 2 === 0 ? 1 : -1) * 40}deg`,
            animationDelay: `${index * 0.03}s`,
          } as CSSProperties,
        };
      }),
    [],
  );

  return (
    <section aria-labelledby="presente-do-dia" className="np-container py-10 sm:py-14">
      <div className="edge edge-gold relative overflow-hidden rounded-2xl bg-linear-to-br from-bordo/60 via-surface to-pine-deep/40 shadow-e3">
        {/* halos */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-primary/25 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-24 size-72 rounded-full bg-gold/20 blur-3xl"
        />
        {/* padrão de estrelas */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,.7) 0.8px, transparent 1.6px)',
            backgroundSize: '42px 42px',
          }}
        />

        <div className="relative grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:gap-12 lg:p-12">
          {/* ---------------- texto ---------------- */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Badge tone="pine" icon="⏰" pulse>
                Renova em 12 h 04 min
              </Badge>
            </div>

            <h2
              id="presente-do-dia"
              className="mt-4 font-display text-display font-semibold text-snow-grad"
            >
              <span aria-hidden="true" className="mr-2">
                🎁
              </span>
              Presente do dia
            </h2>

            <p className="mx-auto mt-3 max-w-md text-[1rem] text-muted lg:mx-0">
              {opened
                ? 'Presente aberto! Ele já está esperando na sua carteira. Volte amanhã para o próximo.'
                : 'Seu presente de hoje está esperando. Abra e veja o que o Noel deixou embaixo da árvore.'}
            </p>

            {/* recompensa revelada */}
            <div
              className={cx(
                'mx-auto mt-6 max-w-md overflow-hidden transition-[max-height,opacity] duration-600 ease-[var(--ease-out-quint)] lg:mx-0',
                opened ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0',
              )}
              aria-live="polite"
            >
              <div className="edge edge-gold flex items-center gap-4 rounded-xl bg-black/35 p-4 text-left backdrop-blur-sm">
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-lg bg-linear-to-b from-gold-hi to-gold-deep text-[1.6rem] shadow-glow-gold"
                >
                  {dailyReward.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[1.05rem] font-semibold text-gold-hi">
                    {dailyReward.title}
                  </span>
                  <span className="block text-[0.82rem] text-muted">{dailyReward.detail}</span>
                  <span className="mt-1 inline-block rounded-full bg-pine/20 px-2 py-0.5 text-[0.7rem] font-semibold text-pine-hi">
                    {dailyReward.extra}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
              {opened ? (
                <>
                  <Button to="/carteira" variant="gold" size="lg" icon="👛">
                    Ver na carteira
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => setOpened(false)}>
                    Fechar presente
                  </Button>
                </>
              ) : (
                <Button
                  variant="festive"
                  size="lg"
                  icon="🎁"
                  className="shine-auto"
                  onClick={() => setOpened(true)}
                >
                  Abrir presente
                </Button>
              )}
            </div>
          </div>

          {/* ---------------- caixa ---------------- */}
          <div className="relative mx-auto w-56 sm:w-64 lg:w-72">
            <span
              aria-hidden="true"
              className={cx(
                'pointer-events-none absolute inset-0 -z-1 rounded-full blur-2xl transition-opacity duration-700',
                opened ? 'opacity-100' : 'opacity-60',
              )}
              style={{
                background: 'radial-gradient(closest-side, oklch(0.9 0.16 88 / 60%), transparent 70%)',
              }}
            />

            <button
              type="button"
              onClick={() => setOpened((value) => !value)}
              aria-pressed={opened}
              className="group relative block w-full cursor-pointer rounded-2xl transition-transform duration-400 ease-[var(--ease-spring)] hover:scale-105 active:scale-97"
            >
              <span className="sr-only">
                {opened ? 'Fechar o presente do dia' : 'Abrir o presente do dia'}
              </span>
              <GiftBox
                accent="red"
                open={opened}
                className={cx('w-full drop-shadow-[0_22px_36px_rgba(0,0,0,.55)]', !opened && 'animate-float')}
              />
            </button>

            {/* explosão de partículas ao abrir */}
            {opened ? (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
                {burst.map((particle) => (
                  <span
                    key={particle.key}
                    className="absolute animate-burst text-[1.1rem] text-gold-hi"
                    style={particle.style}
                  >
                    {particle.icon}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
