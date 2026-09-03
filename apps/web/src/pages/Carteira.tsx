import { Coin } from '@/components/art/Coin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { player, transactions } from '@/data/gamification';
import { money, number, cx } from '@/lib/format';

const quickAmounts = [20, 50, 100, 250];

const typeMeta = {
  deposito: { icon: '⬇️', label: 'Depósito' },
  premio: { icon: '🏆', label: 'Prêmio' },
  saque: { icon: '⬆️', label: 'Saque' },
  compra: { icon: '🎟️', label: 'Compra' },
  bonus: { icon: '🎁', label: 'Bônus' },
} as const;

export function Carteira() {
  return (
    <>
      <PageHero
        icon="👛"
        eyebrow="Conta de demonstração"
        title="Carteira"
        subtitle="Saldo, bônus, depósitos e saques. Todos os valores desta tela são fictícios."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Carteira' }]}
        aside={
          <Badge tone="neutral" icon="🧪">
            valores mockados
          </Badge>
        }
      />

      <section className="np-container pb-16">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* ---------------- saldo ---------------- */}
          <div className="edge edge-gold relative overflow-hidden rounded-2xl bg-linear-to-br from-bordo/60 via-surface-2 to-surface p-6 shadow-e3 lg:col-span-2">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-gold/25 blur-3xl"
            />
            <Coin className="pointer-events-none absolute top-6 right-6 w-16 animate-float opacity-90" />

            <div className="relative">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-dim">
                saldo disponível
              </span>
              <p className="mt-2 font-display text-[clamp(2.2rem,6vw,3.2rem)] leading-none font-semibold text-gold-grad tnum">
                {money(player.balance)}
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="rounded-full border border-pine/35 bg-pine/12 px-3 py-1.5 text-[0.8rem] text-pine-hi">
                  🎁 Bônus: <strong className="font-semibold">{money(player.bonusBalance)}</strong>
                </span>
                <span className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-[0.8rem] text-muted">
                  🪙 Moedas: <strong className="font-semibold text-gold-hi">{number(player.coins)}</strong>
                </span>
              </div>

              <div className="mt-6 max-w-md">
                <div className="mb-1.5 flex items-baseline justify-between text-[0.78rem]">
                  <span className="text-muted">Rollover do bônus de Natal</span>
                  <span className="text-dim tnum">R$ 120 / R$ 500</span>
                </div>
                <ProgressBar value={120} max={500} accent="pine" size="sm" label="Rollover do bônus" />
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button variant="gold" size="lg" icon="⚡" className="shine-auto sm:flex-1">
                  Depositar via PIX
                </Button>
                <Button variant="ghost" size="lg" icon="🏦" className="sm:flex-1">
                  Solicitar saque
                </Button>
              </div>
            </div>
          </div>

          {/* ---------------- depósito rápido ---------------- */}
          <div id="deposito" className="edge scroll-mt-28 rounded-2xl bg-surface/75 p-6 shadow-e2">
            <h2 className="flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">⚡</span> Depósito rápido
            </h2>
            <p className="mt-1.5 text-[0.84rem] text-muted">
              Escolha um valor e receba o QR Code do PIX.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {quickAmounts.map((amount, index) => (
                <button
                  key={amount}
                  type="button"
                  className={cx(
                    'rounded-lg border px-3 py-3 font-display text-[1.05rem] font-semibold transition-[transform,background-color,border-color] duration-250',
                    'hover:-translate-y-0.5 active:translate-y-0',
                    index === 1
                      ? 'border-gold/55 bg-gold/14 text-gold-hi'
                      : 'border-border bg-white/4 text-text-soft hover:border-gold/40 hover:bg-gold/8',
                  )}
                >
                  {money(amount)}
                  {index === 1 ? (
                    <span className="mt-0.5 block text-[0.66rem] font-medium text-pine-hi">
                      + {money(amount)} de bônus
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-dashed border-white/12 bg-black/25 p-4 text-center">
              <span aria-hidden="true" className="block text-[2rem]">
                📱
              </span>
              <p className="mt-2 text-[0.78rem] leading-snug text-dim">
                O QR Code do PIX apareceria aqui. Nesta etapa nenhum pagamento é processado.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- extrato ---------------- */}
        <div id="saques" className="mt-12 scroll-mt-28">
          <SectionHeader icon="🧾" title="Extrato" subtitle="Últimas movimentações da conta de demonstração." />

          <div className="edge overflow-hidden rounded-xl bg-surface/70">
            <ul className="divide-y divide-white/6">
              {transactions.map((item) => {
                const meta = typeMeta[item.type];
                const positive = item.value >= 0;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3.5 px-4 py-3.5 transition-colors duration-250 hover:bg-white/4 sm:px-5"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-black/30 text-[1.05rem]"
                    >
                      {meta.icon}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9rem] font-medium text-text">
                        {item.label}
                      </span>
                      <span className="flex items-center gap-2 text-[0.74rem] text-dim">
                        {item.date}
                        <span
                          className={cx(
                            'rounded-full px-1.5 py-0.5 text-[0.66rem] font-semibold',
                            item.status === 'concluido'
                              ? 'bg-pine/15 text-pine-hi'
                              : 'bg-ember/15 text-ember-hi',
                          )}
                        >
                          {item.status === 'concluido' ? 'concluído' : 'pendente'}
                        </span>
                      </span>
                    </span>

                    <span
                      className={cx(
                        'price-chip shrink-0 text-[0.98rem]',
                        positive ? 'text-pine-hi' : 'text-muted',
                      )}
                    >
                      {positive ? '+' : '−'} {money(Math.abs(item.value))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
