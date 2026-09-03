import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Snowfall } from '@/components/ui/Snowfall';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileTabBar } from './MobileTabBar';

/** Volta ao topo a cada navegação (mantém âncoras funcionando). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}

export function Layout() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Snowfall count={24} />
      <ScrollToTop />

      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-bordo-deep"
      >
        Pular para o conteúdo
      </a>

      <Header />

      <main id="conteudo" className="relative z-1 flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* espaço para a barra fixa do mobile não cobrir o rodapé */}
      <div aria-hidden="true" className="h-20 lg:hidden" />
      <MobileTabBar />
    </div>
  );
}
