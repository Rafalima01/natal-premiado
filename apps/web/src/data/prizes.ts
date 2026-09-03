import type { Prize } from './types';

/** Vitrine de prêmios (/premios) — mock. */
export const prizes: Prize[] = [
  { id: 'p1', name: 'Moto 0km', category: 'automoveis', value: 20000, rarity: 'lendário', icon: '🏍️', accent: 'red' },
  { id: 'p2', name: 'Relógio suíço', category: 'luxo', value: 80000, rarity: 'lendário', icon: '⌚', accent: 'gold' },
  { id: 'p3', name: 'Barra de ouro 250g', category: 'luxo', value: 50000, rarity: 'lendário', icon: '🥇', accent: 'gold' },
  { id: 'p4', name: 'MacBook Air M4', category: 'tecnologia', value: 12500, rarity: 'lendário', icon: '💻', accent: 'ice' },
  { id: 'p5', name: 'Trenó do Noel', category: 'natal', value: 10000, rarity: 'lendário', icon: '🛷', accent: 'red' },
  { id: 'p6', name: 'Scooter elétrica', category: 'automoveis', value: 9800, rarity: 'épico', icon: '🛵', accent: 'ember' },
  { id: 'p7', name: 'iPhone 17', category: 'tecnologia', value: 8499, rarity: 'épico', icon: '📲', accent: 'ice' },
  { id: 'p8', name: 'PlayStation 5 Pro', category: 'games', value: 6800, rarity: 'épico', icon: '🕹️', accent: 'royal' },
  { id: 'p9', name: 'Ceia dos sonhos + R$ 5.000', category: 'natal', value: 6000, rarity: 'épico', icon: '🎁', accent: 'pine' },
  { id: 'p10', name: 'Setup gamer completo', category: 'games', value: 5000, rarity: 'épico', icon: '✨', accent: 'royal' },
  { id: 'p11', name: 'Geladeira Frost Free', category: 'tecnologia', value: 4000, rarity: 'épico', icon: '❄️', accent: 'ice' },
  { id: 'p12', name: 'Colar de ouro', category: 'luxo', value: 4200, rarity: 'raro', icon: '📿', accent: 'gold' },
  { id: 'p13', name: 'Tênis edição limitada', category: 'nike', value: 3400, rarity: 'raro', icon: '👟', accent: 'ember' },
  { id: 'p14', name: 'Óculos VR', category: 'tecnologia', value: 2999, rarity: 'raro', icon: '🥽', accent: 'royal' },
  { id: 'p15', name: 'Apple Watch SE', category: 'tecnologia', value: 2799, rarity: 'raro', icon: '⌚', accent: 'ice' },
  { id: 'p16', name: 'Smart TV 55 polegadas', category: 'tecnologia', value: 2600, rarity: 'raro', icon: '📺', accent: 'ice' },
  { id: 'p17', name: 'Máquina de lavar 13kg', category: 'tecnologia', value: 2400, rarity: 'raro', icon: '🧺', accent: 'ice' },
  { id: 'p18', name: 'PIX de R$ 2.000', category: 'dinheiro', value: 2000, rarity: 'raro', icon: '💸', accent: 'pine' },
  { id: 'p19', name: 'Cadeira gamer', category: 'games', value: 1800, rarity: 'raro', icon: '🪑', accent: 'royal' },
  { id: 'p20', name: 'Bolsa de grife', category: 'moda', value: 18000, rarity: 'épico', icon: '👜', accent: 'candy' },
  { id: 'p21', name: 'Monitor 27 pol 165Hz', category: 'games', value: 1499, rarity: 'raro', icon: '🖥️', accent: 'royal' },
  { id: 'p22', name: 'AirPods 4', category: 'tecnologia', value: 1299, rarity: 'raro', icon: '🎧', accent: 'ice' },
  { id: 'p23', name: 'Kit completo de beleza', category: 'moda', value: 1000, rarity: 'raro', icon: '💎', accent: 'candy' },
  { id: 'p24', name: 'Micro-ondas 32L', category: 'tecnologia', value: 799, rarity: 'comum', icon: '📦', accent: 'ice' },
  { id: 'p25', name: 'Combo ceia completa', category: 'natal', value: 800, rarity: 'comum', icon: '🎄', accent: 'pine' },
  { id: 'p26', name: 'Perfume importado', category: 'moda', value: 650, rarity: 'comum', icon: '🌸', accent: 'candy' },
  { id: 'p27', name: 'Camiseta grife', category: 'moda', value: 590, rarity: 'comum', icon: '👕', accent: 'candy' },
  { id: 'p28', name: 'Cesta de Natal', category: 'natal', value: 400, rarity: 'comum', icon: '🧺', accent: 'pine' },
  { id: 'p29', name: 'Air fryer 5L', category: 'tecnologia', value: 399, rarity: 'comum', icon: '🍟', accent: 'ember' },
  { id: 'p30', name: '1 ano de academia', category: 'natal', value: 300, rarity: 'comum', icon: '🏋️', accent: 'pine' },
  { id: 'p31', name: 'Whisky 12 anos', category: 'natal', value: 420, rarity: 'comum', icon: '🥃', accent: 'gold' },
  { id: 'p32', name: 'PIX de R$ 100', category: 'dinheiro', value: 100, rarity: 'comum', icon: '💵', accent: 'pine' },
];

export const rarityOrder: Record<Prize['rarity'], number> = {
  'lendário': 0,
  'épico': 1,
  raro: 2,
  comum: 3,
};
