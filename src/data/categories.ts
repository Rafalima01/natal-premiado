import type { Category } from './types';

export const categories: Category[] = [
  {
    id: 'super-premios',
    name: 'Super Prêmios',
    blurb: 'Os tetos mais altos da casa',
    icon: '🏆',
    accent: 'gold',
    count: 6,
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    blurb: 'iPhone, notebook e setup',
    icon: '📱',
    accent: 'ice',
    count: 4,
  },
  {
    id: 'games',
    name: 'Games',
    blurb: 'Console, jogo e cadeira',
    icon: '🎮',
    accent: 'royal',
    count: 2,
  },
  {
    id: 'nike',
    name: 'Nike',
    blurb: 'Tênis, drop e streetwear',
    icon: '👟',
    accent: 'ember',
    count: 2,
  },
  {
    id: 'moda',
    name: 'Moda',
    blurb: 'Look completo de festa',
    icon: '🧥',
    accent: 'candy',
    count: 3,
  },
  {
    id: 'luxo',
    name: 'Luxo',
    blurb: 'Joias, relógio e grife',
    icon: '💎',
    accent: 'gold',
    count: 2,
  },
  {
    id: 'automoveis',
    name: 'Automóveis',
    blurb: 'Saia motorizado da ceia',
    icon: '🏍️',
    accent: 'red',
    count: 1,
  },
  {
    id: 'dinheiro',
    name: 'Dinheiro',
    blurb: 'PIX direto na conta',
    icon: '💰',
    accent: 'pine',
    count: 2,
  },
  {
    id: 'natal',
    name: 'Natal',
    blurb: 'Exclusivas de dezembro',
    icon: '🎄',
    accent: 'pine',
    count: 5,
  },
];

export const getCategory = (id: string) => categories.find((category) => category.id === id);
