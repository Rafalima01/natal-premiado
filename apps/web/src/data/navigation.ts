export interface NavLink {
  label: string;
  href: string;
  icon: string;
}

export const primaryNav: NavLink[] = [
  { label: 'Início', href: '/', icon: '🏠' },
  { label: 'Raspadinhas', href: '/raspadinhas', icon: '🎟️' },
  { label: 'Prêmios', href: '/premios', icon: '🏆' },
  { label: 'Pacotes', href: '/pacotes', icon: '📦' },
  { label: 'Natal', href: '/#evento-de-natal', icon: '🎄' },
];

export const footerColumns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Início', href: '/' },
      { label: 'Raspadinhas', href: '/raspadinhas' },
      { label: 'Prêmios', href: '/premios' },
      { label: 'Pacotes', href: '/pacotes' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Carteira', href: '/carteira' },
      { label: 'Depósito', href: '/carteira#deposito' },
      { label: 'Saques', href: '/carteira#saques' },
      { label: 'Perfil', href: '/perfil' },
    ],
  },
  {
    title: 'Ajuda',
    links: [
      { label: 'Termos de uso', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Jogo responsável', href: '/jogo-responsavel' },
      { label: 'Suporte', href: '/suporte' },
    ],
  },
];

export const trustSeals = [
  { label: 'PIX', icon: '⚡', note: 'Depósito e saque instantâneos' },
  { label: 'SSL 256 bits', icon: '🔒', note: 'Conexão criptografada' },
  { label: 'Jogo responsável', icon: '🛟', note: 'Limites e autoexclusão' },
  { label: '+18', icon: '🔞', note: 'Proibido para menores' },
];
