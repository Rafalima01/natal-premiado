import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GiftBox } from '@/components/art/GiftBox';
import { Coin } from '@/components/art/Coin';
import { Badge } from '@/components/ui/Badge';
import { LightString } from '@/components/ui/LightString';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** destaques mostrados no painel decorativo */
  perks: { icon: string; title: string; text: string }[];
  footer: ReactNode;
  children: ReactNode;
}

/** Moldura compartilhada por /login e /cadastro. */
export function AuthShell({ eyebrow, title, subtitle, perks, footer, children }: AuthShellProps) {
  return (
    <section className="np-container py-10 sm:py-14">
      <div className="edge edge-gold relative overflow-hidden rounded-2xl bg-linear-to-br from-bordo/50 via-surface to-bg-deep shadow-e3">
        <LightString className="absolute inset-x-0 top-0 opacity-70" count={32} />

        <div className="grid lg:grid-cols-[1fr_0.9fr]">
          {/* ---------------- formulário ---------------- */}
          <div className="relative p-6 pt-10 sm:p-10 lg:p-12">
            <p className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-display text-display font-semibold text-snow-grad">{title}</h1>
            <p className="mt-3 max-w-md text-[0.95rem] text-muted">{subtitle}</p>

            <div className="mt-8 max-w-md">{children}</div>

            <div className="mt-7 max-w-md text-[0.85rem] text-muted">{footer}</div>

            <p className="mt-6 max-w-md rounded-lg border border-white/8 bg-white/4 p-3 text-[0.74rem] leading-relaxed text-dim">
              <span aria-hidden="true" className="mr-1.5">
                🧪
              </span>
              Protótipo visual: este formulário não envia, valida nem armazena nenhum dado. A
              autenticação real entra na próxima etapa.
            </p>
          </div>

          {/* ---------------- painel decorativo ---------------- */}
          <aside className="relative hidden overflow-hidden border-l border-white/8 bg-black/25 p-10 lg:block">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-gold/22 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-pine/20 blur-3xl"
            />

            <div className="relative">
              <Badge tone="pine" icon="🎁" pulse>
                Bônus de 100% no primeiro depósito
              </Badge>

              <div className="relative mt-8 mb-10 grid place-items-center">
                <GiftBox accent="red" className="w-44 animate-float drop-shadow-[0_20px_36px_rgba(0,0,0,.55)]" />
                <Coin
                  className="absolute top-2 -left-2 w-12 animate-bob"
                  style={{ animationDelay: '-1.1s' }}
                />
                <Coin
                  label="$"
                  className="absolute right-0 bottom-4 w-10 animate-float"
                  style={{ animationDelay: '-2.4s' }}
                />
              </div>

              <ul className="grid gap-3">
                {perks.map((perk) => (
                  <li key={perk.title} className="edge flex items-start gap-3 rounded-lg bg-white/5 p-3.5">
                    <span aria-hidden="true" className="text-[1.3rem]">
                      {perk.icon}
                    </span>
                    <span>
                      <span className="block font-display text-[0.9rem] font-semibold text-text">
                        {perk.title}
                      </span>
                      <span className="block text-[0.78rem] leading-snug text-dim">{perk.text}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-[0.74rem] text-dim">
                Ao continuar você concorda com os{' '}
                <Link to="/termos" className="text-gold-hi underline underline-offset-2">
                  Termos de uso
                </Link>{' '}
                e a{' '}
                <Link to="/privacidade" className="text-gold-hi underline underline-offset-2">
                  Política de privacidade
                </Link>
                . Plataforma para maiores de 18 anos.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
