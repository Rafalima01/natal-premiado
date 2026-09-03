import { NavLink, useLocation } from 'react-router-dom';
import { cx } from '@/lib/format';

const tabs = [
  { label: 'Início', href: '/', icon: '🏠' },
  { label: 'Raspar', href: '/raspadinhas', icon: '🎟️' },
  { label: 'Natal', href: '/#evento-de-natal', icon: '🎄', center: true },
  { label: 'Prêmios', href: '/premios', icon: '🏆' },
  { label: 'Perfil', href: '/perfil', icon: '👤' },
];

/**
 * Navegação principal do mobile — barra fixa inferior, com o item do evento
 * elevado no centro. Some a partir de `lg`, onde o header já resolve tudo.
 */
export function MobileTabBar() {
  const { pathname, hash } = useLocation();

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/' && hash === href.slice(1);
    if (href === '/') return pathname === '/' && !hash;
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Navegação principal (mobile)"
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative border-t border-white/10 bg-bg-deep/92 backdrop-blur-xl">
        {/* fio de luz no topo da barra */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-gold/60 to-transparent"
        />
        <ul className="grid grid-cols-5 items-end px-1 pt-1.5 pb-2">
          {tabs.map((tab) => {
            const active = isActive(tab.href);

            if (tab.center) {
              return (
                <li key={tab.href} className="flex justify-center">
                  <NavLink
                    to={tab.href}
                    className="group -mt-7 flex flex-col items-center gap-1"
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={cx(
                        'grid size-14 place-items-center rounded-full text-[1.45rem] transition-transform duration-300 ease-[var(--ease-spring)]',
                        'bg-[linear-gradient(180deg,#ff8093_0%,var(--color-primary)_55%,var(--color-primary-deep)_100%)]',
                        'shadow-[0_0_0_4px_var(--color-bg-deep),0_8px_22px_-6px_rgba(224,27,51,.9)]',
                        'group-active:scale-92',
                        active && 'ring-2 ring-gold/70',
                      )}
                    >
                      <span aria-hidden="true" className="animate-bob">
                        {tab.icon}
                      </span>
                    </span>
                    <span
                      className={cx(
                        'font-display text-[0.66rem] font-semibold',
                        active ? 'text-gold-hi' : 'text-text-soft',
                      )}
                    >
                      {tab.label}
                    </span>
                  </NavLink>
                </li>
              );
            }

            return (
              <li key={tab.href}>
                <NavLink
                  to={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'group flex flex-col items-center gap-1 rounded-lg py-1.5 transition-colors duration-250',
                    active ? 'text-gold-hi' : 'text-dim hover:text-text-soft',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'text-[1.15rem] transition-transform duration-300 ease-[var(--ease-spring)]',
                      active ? 'scale-110' : 'group-active:scale-90',
                    )}
                  >
                    {tab.icon}
                  </span>
                  <span className="font-display text-[0.66rem] font-semibold">{tab.label}</span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'h-0.5 w-6 rounded-full bg-gold transition-opacity duration-300',
                      active ? 'opacity-100 shadow-[0_0_10px_1px_var(--color-gold)]' : 'opacity-0',
                    )}
                  />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
