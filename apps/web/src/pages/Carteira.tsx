import { formatCents, toCents, type Cents, type LedgerReason } from '@natal/contracts';
import { Coin } from '@/components/art/Coin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSession } from '@/auth/useSession';
import { useLedger, useWallets } from '@/hooks/useWallet';
import { player } from '@/data/gamification';
import { number, cx } from '@/lib/format';

/**
 * Carteira — saldo e extrato reais.
 *
 * `money()` NÃO é importado aqui, de propósito. Ele recebe reais em ponto
 * flutuante; a API devolve centavos inteiros. `money(13750)` compilaria e
 * renderizaria "R$ 13.750,00" — cem vezes o valor, sem erro e com aparência
 * plausível. Manter os dois formatadores no mesmo arquivo é o que produz esse
 * bug, então esta tela usa só `formatCents` (ADR 0002, D6).
 *
 * `player.coins` continua vindo do mock de gamificação: moeda de jogo não é
 * dinheiro e não passa pelo ledger.
 */

/** Valores de depósito em CENTAVOS, como todo o resto da tela. */
const quickAmounts: Cents[] = [2_000, 5_000, 10_000, 25_000].map((v) => toCents(v));

const reasonMeta: Record<LedgerReason, { icon: string; label: string }> = {
  'deposit.settled': { icon: '⬇️', label: 'Depósito' },
  'adjustment.credit': { icon: '🛠️', label: 'Ajuste' },
  'game.purchase': { icon: '🎟️', label: 'Compra' },
  'prize.credit': { icon: '🏆', label: 'Prêmio' },
  'bonus.granted': { icon: '🎁', label: 'Bônus recebido' },
  'bonus.expired': { icon: '⌛', label: 'Bônus expirado' },
  'bonus.converted': { icon: '🔄', label: 'Bônus convertido' },
};

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function Carteira() {
  const { session } = useSession();
  const wallets = useWallets();
  const ledger = useLedger();

  const cashLabel = wallets.cash ? formatCents(wallets.cash.balanceCents) : '—';
  const bonusLabel = wallets.bonus ? formatCents(wallets.bonus.balanceCents) : '—';

  return (
    <>
      <PageHero
        icon="👛"
        eyebrow={session ? 'Sua conta' : 'Conta de demonstração'}
        title="Carteira"
        subtitle={
          session
            ? 'Saldo e extrato da sua conta. Depósito e saque ainda não estão disponíveis.'
            : 'Entre para ver o saldo e o extrato da sua conta.'
        }
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Carteira' }]}
        aside={
          session ? (
            <Badge tone="neutral" icon="🔒">
              saldo real
            </Badge>
          ) : (
            <Badge tone="neutral" icon="🔑">
              entre para ver
            </Badge>
          )
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

              {wallets.loading ? (
                <span
                  aria-hidden="true"
                  className="mt-2 block h-[clamp(2.2rem,6vw,3.2rem)] w-56 rounded-lg bg-white/6"
                />
              ) : (
                <p className="mt-2 font-display text-[clamp(2.2rem,6vw,3.2rem)] leading-none font-semibold text-gold-grad tnum">
                  {cashLabel}
                </p>
              )}

              {wallets.error ? (
                <p className="mt-2 text-[0.8rem] text-ember-hi">
                  Não foi possível carregar o saldo. {wallets.error}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="rounded-full border border-pine/35 bg-pine/12 px-3 py-1.5 text-[0.8rem] text-pine-hi">
                  🎁 Bônus: <strong className="font-semibold">{bonusLabel}</strong>
                </span>
                <span className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-[0.8rem] text-muted">
                  🪙 Moedas: <strong className="font-semibold text-gold-hi">{number(player.coins)}</strong>
                </span>
              </div>

              {/* O medidor de rollover foi removido: ele exibia um valor fixo em
                  reais ao lado de um saldo real em centavos. Rollover é regra de
                  produto do BONUS e pertence à Fase 8 — mostrar um número
                  inventado ao lado de dinheiro de verdade é pior que não mostrar. */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button variant="gold" size="lg" icon="⚡" className="shine-auto sm:flex-1" disabled>
                  Depositar via PIX
                </Button>
                <Button variant="ghost" size="lg" icon="🏦" className="sm:flex-1" disabled>
                  Solicitar saque
                </Button>
              </div>
              <p className="mt-2 text-[0.74rem] text-dim">
                Depósito e saque dependem da integração de pagamento, ainda não liberada.
              </p>
            </div>
          </div>

          {/* ---------------- depósito rápido ---------------- */}
          <div id="deposito" className="edge scroll-mt-28 rounded-2xl bg-surface/75 p-6 shadow-e2">
            <h2 className="flex items-center gap-2 font-display text-[1.05rem] font-semibold text-text">
              <span aria-hidden="true">⚡</span> Depósito rápido
            </h2>
            <p className="mt-1.5 text-[0.84rem] text-muted">
              Prévia da tela. Nenhum pagamento é processado nesta etapa.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {quickAmounts.map((amount, index) => (
                <button
                  key={amount}
                  type="button"
                  disabled
                  className={cx(
                    'rounded-lg border px-3 py-3 font-display text-[1.05rem] font-semibold transition-[transform,background-color,border-color] duration-250',
                    'disabled:cursor-not-allowed disabled:opacity-70',
                    index === 1
                      ? 'border-gold/55 bg-gold/14 text-gold-hi'
                      : 'border-border bg-white/4 text-text-soft',
                  )}
                >
                  {formatCents(amount)}
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
          <SectionHeader icon="🧾" title="Extrato" subtitle="Movimentações da sua conta." />

          <div className="edge overflow-hidden rounded-xl bg-surface/70">
            {ledger.loading ? (
              <p className="px-5 py-8 text-center text-[0.85rem] text-dim">Carregando extrato…</p>
            ) : ledger.error ? (
              <p className="px-5 py-8 text-center text-[0.85rem] text-ember-hi">
                Não foi possível carregar o extrato. {ledger.error}
              </p>
            ) : !session ? (
              <p className="px-5 py-8 text-center text-[0.85rem] text-dim">
                Entre na sua conta para ver o extrato.
              </p>
            ) : (ledger.data?.entries.length ?? 0) === 0 ? (
              <p className="px-5 py-8 text-center text-[0.85rem] text-dim">
                Nenhuma movimentação ainda.
              </p>
            ) : (
              <ul className="divide-y divide-white/6">
                {ledger.data?.entries.map((entry) => {
                  const meta = reasonMeta[entry.reason];
                  const positive = entry.amountCents > 0;
                  return (
                    <li
                      key={entry.entryId}
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
                          {meta.label}
                        </span>
                        <span className="flex items-center gap-2 text-[0.74rem] text-dim">
                          {dateFormat.format(new Date(entry.createdAt))}
                          <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[0.66rem] font-semibold text-muted">
                            {entry.walletKind === 'CASH' ? 'saldo' : 'bônus'}
                          </span>
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span
                          className={cx(
                            'price-chip block text-[0.98rem]',
                            positive ? 'text-pine-hi' : 'text-muted',
                          )}
                        >
                          {positive ? '+' : '−'} {formatCents(Math.abs(entry.amountCents) as Cents)}
                        </span>
                        {/* Saldo depois DESTE lançamento: pertence à perna, não
                            à operação (ADR 0002, D12). */}
                        <span className="block text-[0.7rem] text-dim tnum">
                          saldo {formatCents(entry.balanceAfterCents)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
