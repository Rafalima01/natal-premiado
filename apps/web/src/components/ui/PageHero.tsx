import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LightString } from './LightString';
import { cx } from '@/lib/format';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  icon?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  aside?: ReactNode;
  className?: string;
}

/** Cabeçalho padrão das páginas internas — mantém a identidade entre rotas. */
export function PageHero({ icon, eyebrow, title, subtitle, crumbs, aside, className }: PageHeroProps) {
  return (
    <section className={cx('relative overflow-hidden', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-32 h-96"
        style={{
          background:
            'radial-gradient(42rem 22rem at 20% 60%, oklch(0.5 0.21 22 / 42%), transparent 68%), radial-gradient(32rem 20rem at 82% 30%, oklch(0.6 0.15 88 / 26%), transparent 66%)',
        }}
      />
      <LightString className="absolute inset-x-0 top-0 opacity-50" count={30} />

      <div className="np-container relative pt-10 pb-8 sm:pt-14 sm:pb-10">
        {crumbs?.length ? (
          <nav aria-label="Trilha de navegação" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-dim">
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-white/20">
                      /
                    </span>
                  ) : null}
                  {crumb.href ? (
                    <Link to={crumb.href} className="transition-colors duration-250 hover:text-gold-hi">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-muted">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p className="mb-2 flex items-center gap-2 font-display text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold">
                <span aria-hidden="true" className="h-px w-6 bg-linear-to-r from-gold to-transparent" />
                {eyebrow}
              </p>
            ) : null}

            <h1 className="flex flex-wrap items-center gap-x-3 font-display text-display font-semibold">
              {icon ? (
                <span aria-hidden="true" className="text-[0.85em] drop-shadow-[0_6px_16px_rgba(0,0,0,.5)]">
                  {icon}
                </span>
              ) : null}
              <span className="text-snow-grad">{title}</span>
            </h1>

            {subtitle ? <p className="mt-3 text-[1rem] text-muted">{subtitle}</p> : null}
          </div>

          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
