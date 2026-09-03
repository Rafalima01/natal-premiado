import { Link } from 'react-router-dom';
import { Logo } from '@/components/art/Logo';
import { Button } from '@/components/ui/Button';
import { LightString } from '@/components/ui/LightString';
import { footerColumns, trustSeals } from '@/data/navigation';

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/8 bg-linear-to-b from-bordo-deep/45 to-bg-deep">
      {/* neve acumulada na borda superior */}
      <span aria-hidden="true" className="snowcap opacity-70" />
      <LightString className="absolute inset-x-0 top-5 opacity-55" count={26} />

      {/* pinheiros no rodapé, bem discretos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-15"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, transparent 0 46px, rgba(47,212,131,.5) 46px 47px), repeating-linear-gradient(-115deg, transparent 0 46px, rgba(47,212,131,.5) 46px 47px)',
          maskImage: 'linear-gradient(0deg, #000, transparent)',
        }}
      />

      <div className="np-container relative pt-16 pb-10">
        {/* ---------- chamada final ---------- */}
        <div className="edge edge-gold relative mb-14 overflow-hidden rounded-2xl bg-linear-to-br from-primary-deep/60 via-bordo/50 to-pine-deep/45 p-7 sm:p-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-gold/25 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-[clamp(1.4rem,3vw,2.1rem)] font-semibold text-snow-grad">
                O Natal já começou. Falta você.
              </h2>
              <p className="mt-2 max-w-xl text-[0.95rem] text-muted">
                Crie sua conta em menos de um minuto e receba o bônus de boas-vindas de 100% para
                começar a raspar.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button to="/cadastro" variant="gold" size="lg" icon="🎁">
                Criar conta grátis
              </Button>
              <Button to="/raspadinhas" variant="ghost" size="lg">
                Ver raspadinhas
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- colunas ---------- */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-[0.9rem] leading-relaxed text-muted">
              Natal Premiado é uma plataforma de raspadinhas e caixas premiadas com temática de
              Natal. Presentes, prêmios e eventos — todos os dias de dezembro.
            </p>
            <div className="mt-5 flex gap-2">
              {['📸', '▶️', '🐦', '💬'].map((icon) => (
                <span
                  key={icon}
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-full border border-border bg-white/5 text-[0.95rem] transition-colors duration-250 hover:border-gold/45 hover:bg-gold/12"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="mb-4 flex items-center gap-2 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-gold">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="group inline-flex items-center gap-2 text-[0.9rem] text-muted transition-colors duration-250 hover:text-white"
                    >
                      <span
                        aria-hidden="true"
                        className="h-px w-0 bg-gold transition-[width] duration-300 ease-[var(--ease-out-quint)] group-hover:w-3"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ---------- selos ---------- */}
        <div className="mt-12 grid gap-3 border-t border-white/8 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustSeals.map((seal) => (
            <div
              key={seal.label}
              className="flex items-center gap-3 rounded-lg border border-border bg-white/4 px-4 py-3"
            >
              <span aria-hidden="true" className="text-[1.25rem]">
                {seal.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[0.85rem] font-semibold text-text">
                  {seal.label}
                </span>
                <span className="block text-[0.76rem] text-dim">{seal.note}</span>
              </span>
            </div>
          ))}
        </div>

        {/* ---------- legal ---------- */}
        <div className="mt-8 flex flex-col gap-4 border-t border-white/8 pt-7 text-[0.76rem] leading-relaxed text-dim lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-3xl">
            <strong className="text-muted">Aviso:</strong> este é um protótipo de interface. Todos
            os prêmios, saldos, valores, ganhadores e eventos exibidos são fictícios e servem apenas
            para demonstração visual. Nenhuma transação real é processada. Jogos com prêmios podem
            causar dependência — jogue com responsabilidade e estabeleça limites.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-danger/40 font-display text-[0.7rem] font-semibold text-danger">
              18+
            </span>
            <span>© 2026 Natal Premiado.
              <br />
              Todos os direitos reservados.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
