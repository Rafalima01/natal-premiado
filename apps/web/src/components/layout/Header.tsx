import { NavLink, useLocation } from 'react-router-dom';
import { useSession } from '@/auth/useSession';
import { Logo } from '@/components/art/Logo';
import { Button } from '@/components/ui/Button';
import { LightString } from '@/components/ui/LightString';
import { primaryNav } from '@/data/navigation';
import { useScrolled } from '@/hooks/useScrolled';
import { cx } from '@/lib/format';

export function Header() {
  const scrolled = useScrolled(10);
  const { pathname, hash } = useLocation();
  const { session, player, loading, signOut } = useSession();

  // O player vem da API e pode demorar um instante a mais que a sessão.
  // Enquanto isso, usa o nome dos metadados do provedor e, no limite, a parte
  // local do e-mail — o header nunca fica sem rótulo.
  const displayName =
    player?.displayName ??
    (session?.user.user_metadata?.['full_name'] as string | undefined) ??
    session?.user.email?.split('@')[0] ??
    'Minha conta';

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/' && hash === href.slice(1);
    if (href === '/') return pathname === '/' && !hash;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cx(
        'sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-350 ease-[var(--ease-out-quint)]',
        scrolled
          ? 'bg-bg-deep/88 shadow-[0_10px_30px_-18px_rgba(0,0,0,.9)] backdrop-blur-xl'
          : 'bg-bg-deep/45 backdrop-blur-md',
      )}
    >
      {/* fio de luzes — acabamento discreto no topo */}
      <LightString className="absolute inset-x-0 top-0 opacity-80" count={30} />

      <div
        className={cx(
          'np-container flex items-center gap-4 transition-[height] duration-350',
          scrolled ? 'h-[68px]' : 'h-[76px]',
        )}
      >
        <NavLink to="/" className="shrink-0" aria-label="Natal Premiado — página inicial">
          <Logo size="md" className="transition-transform duration-350 hover:scale-[1.03]" />
        </NavLink>

        {/* ---------- navegação desktop ---------- */}
        <nav aria-label="Navegação principal" className="ml-2 hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={cx(
                      'group relative flex items-center gap-2 rounded-full px-4 py-2 text-[0.92rem] font-semibold',
                      'transition-colors duration-250',
                      active ? 'text-gold-hi' : 'text-text-soft hover:text-white',
                    )}
                  >
                    {/* pílula de fundo do estado ativo (atrás do conteúdo) */}
                    <span
                      aria-hidden="true"
                      className={cx(
                        'absolute inset-0 rounded-full border transition-opacity duration-300',
                        active
                          ? 'border-gold/35 bg-gold/12 opacity-100 shadow-[0_0_20px_-6px_var(--color-gold)]'
                          : 'border-transparent bg-white/6 opacity-0 group-hover:opacity-100',
                      )}
                    />
                    <span
                      aria-hidden="true"
                      className={cx(
                        'relative z-1 text-[0.95rem] transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-120',
                        active ? 'opacity-100' : 'opacity-70',
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="relative z-1">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---------- ações ----------
            Dois estados, sempre dois elementos no mesmo slot: o espaçamento,
            os tamanhos e a responsividade não mudam entre deslogado e logado. */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {loading ? (
            // Reserva a altura do slot durante a resolução da sessão, para o
            // header não pular quando os botões aparecerem.
            <span aria-hidden="true" className="h-9 w-32 rounded-full bg-white/5" />
          ) : session ? (
            <>
              {/* No mobile fica só o ícone: o nome iria empurrar o botão de
                  sair para fora. O rótulo continua no acessível, para o botão
                  nunca ficar sem nome. */}
              <Button to="/perfil" variant="ghost" size="sm" icon="👤">
                <span className="sr-only sm:hidden">Meu perfil</span>
                <span className="hidden max-w-[10rem] truncate sm:block">{displayName}</span>
              </Button>

              {/* Rótulo único: este botão desloga nos dois tamanhos. */}
              <Button variant="ghost" size="sm" icon="🚪" onClick={() => void signOut()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              {/* o wrapper é que esconde: aplicar `hidden` no próprio botão
                  brigaria com o `inline-flex` da base dele */}
              <span className="hidden sm:block">
                <Button to="/login" variant="ghost" size="sm" icon="🔑">
                  Entrar
                </Button>
              </span>

              <div className="relative">
                {/* selo de bônus ancorado ao CTA de maior peso */}
                <span className="pointer-events-none absolute -top-2.5 -right-1.5 z-10 rounded-full bg-linear-to-b from-pine-hi to-pine-deep px-2 py-0.5 font-display text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-bordo-deep shadow-glow-pine animate-pulse-glow">
                  100% extra
                </span>
                <Button to="/cadastro" variant="gold" size="sm" icon="🎁">
                  <span className="hidden sm:inline">Cadastre-se</span>
                  <span className="sm:hidden">Criar conta</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---------- faixa de bônus (só desktop, some ao rolar) ---------- */}
      <div
        className={cx(
          'hidden overflow-hidden border-t border-white/6 bg-linear-to-r from-primary-deep/40 via-bordo/30 to-pine-deep/40 transition-[height,opacity] duration-350 lg:block',
          scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100',
        )}
      >
        <div className="np-container flex h-9 items-center justify-center gap-6 text-[0.78rem] text-text-soft">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true">🎁</span> Bônus de Natal de <strong className="text-gold">100%</strong> no
            primeiro depósito
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-white/15" />
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true">⚡</span> Saque via PIX em minutos
          </span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-white/15 xl:block" />
          <span className="hidden items-center gap-1.5 xl:flex">
            <span aria-hidden="true">🎄</span> Evento de Natal ativo até 25/12
          </span>
        </div>
      </div>
    </header>
  );
}
