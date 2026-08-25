import type { ScratchCard } from './types';

/**
 * Catálogo de raspadinhas — 100% mockado.
 * `image` fica vazio de propósito: o card cai no artwork gerado (PrizeArt)
 * até os assets definitivos chegarem.
 */
export const scratchCards: ScratchCard[] = [
  {
    id: 'pix-na-conta',
    title: 'PIX na Conta',
    tagline: 'Dinheiro vivo, na hora',
    description:
      'A clássica que todo mundo entende: raspou, ganhou, caiu no PIX. Prêmios em dinheiro de R$ 5 até R$ 2.000 direto na sua chave.',
    maxPrize: 2000,
    price: 2,
    accent: 'pine',
    icon: '💸',
    badge: { label: '2× chance', tone: 'ember', icon: '🔥' },
    categories: ['dinheiro', 'natal'],
    hot: true,
    prizes: [
      { name: 'R$ 5 no PIX', value: 5, rarity: 'comum', icon: '💵' },
      { name: 'R$ 20 no PIX', value: 20, rarity: 'comum', icon: '💵' },
      { name: 'R$ 100 no PIX', value: 100, rarity: 'raro', icon: '💰' },
      { name: 'R$ 500 no PIX', value: 500, rarity: 'épico', icon: '🤑' },
      { name: 'R$ 2.000 no PIX', value: 2000, rarity: 'lendário', icon: '🏆' },
    ],
  },
  {
    id: 'loja-da-apple',
    title: 'Loja da Apple',
    tagline: 'A maçã embaixo da árvore',
    description:
      'iPhone 17, MacBook, iPad, AirPods e Watch. O Natal em que a caixinha branca é sua.',
    maxPrize: 12500,
    price: 3,
    accent: 'ice',
    icon: '🍎',
    badge: { label: '2× chance', tone: 'ember', icon: '🔥' },
    categories: ['tecnologia', 'super-premios'],
    hot: true,
    prizes: [
      { name: 'Capa MagSafe', value: 249, rarity: 'comum', icon: '📱' },
      { name: 'AirPods 4', value: 1299, rarity: 'raro', icon: '🎧' },
      { name: 'Apple Watch SE', value: 2799, rarity: 'raro', icon: '⌚' },
      { name: 'iPhone 17', value: 8499, rarity: 'épico', icon: '📲' },
      { name: 'MacBook Air M4', value: 12500, rarity: 'lendário', icon: '💻' },
    ],
  },
  {
    id: 'sextou',
    title: 'Sextou',
    tagline: 'O brinde é por nossa conta',
    description:
      'Combo de bebidas, whisky, cerveja gelada e o kit completo pra ceia não acabar cedo.',
    maxPrize: 800,
    price: 1.5,
    accent: 'gold',
    icon: '🍻',
    badge: { label: '2× chance', tone: 'ember', icon: '🔥' },
    categories: ['natal'],
    prizes: [
      { name: 'Pack 6 long necks', value: 60, rarity: 'comum', icon: '🍺' },
      { name: 'Gin premium', value: 180, rarity: 'comum', icon: '🍸' },
      { name: 'Whisky 12 anos', value: 420, rarity: 'raro', icon: '🥃' },
      { name: 'Combo ceia completa', value: 800, rarity: 'épico', icon: '🎄' },
    ],
  },
  {
    id: 'eletrodomesticos',
    title: 'Eletrodomésticos',
    tagline: 'Sua casa merece presente',
    description:
      'Geladeira, air fryer, máquina de lavar, micro-ondas e cooktop. O Natal que fica na casa o ano inteiro.',
    maxPrize: 4000,
    price: 2.5,
    accent: 'ice',
    icon: '🧺',
    categories: ['tecnologia', 'super-premios'],
    prizes: [
      { name: 'Air fryer 5L', value: 399, rarity: 'comum', icon: '🍟' },
      { name: 'Micro-ondas 32L', value: 799, rarity: 'comum', icon: '📦' },
      { name: 'Máquina de lavar 13kg', value: 2400, rarity: 'raro', icon: '🧺' },
      { name: 'Geladeira Frost Free', value: 4000, rarity: 'lendário', icon: '❄️' },
    ],
  },
  {
    id: 'sonho-de-consumo',
    title: 'Sonho de Consumo',
    tagline: 'Aquele item da sua lista',
    description:
      'Eletrônicos, componentes, periféricos e setup completo. Prêmios exclusivos de alto valor agregado.',
    maxPrize: 5000,
    price: 2,
    accent: 'royal',
    icon: '🕶️',
    badge: { label: 'Top 3', tone: 'gold', icon: '⭐' },
    categories: ['tecnologia', 'games', 'super-premios'],
    prizes: [
      { name: 'Headset gamer', value: 349, rarity: 'comum', icon: '🎧' },
      { name: 'Monitor 27 pol 165Hz', value: 1499, rarity: 'raro', icon: '🖥️' },
      { name: 'Óculos VR', value: 2999, rarity: 'épico', icon: '🥽' },
      { name: 'Setup completo', value: 5000, rarity: 'lendário', icon: '✨' },
    ],
  },
  {
    id: 'super-premio',
    title: 'Super Prêmio',
    tagline: 'Cansado de ficar a pé?',
    description:
      'Essa é a sua chance de sair motorizado da ceia. Moto 0km, scooter elétrica e prêmios de até R$ 20.000.',
    maxPrize: 20000,
    price: 5,
    accent: 'red',
    icon: '🏍️',
    badge: { label: 'Prêmio máx.', tone: 'red', icon: '🚀' },
    categories: ['automoveis', 'super-premios'],
    hot: true,
    prizes: [
      { name: 'Capacete premium', value: 690, rarity: 'comum', icon: '🪖' },
      { name: 'Patinete elétrico', value: 3200, rarity: 'raro', icon: '🛴' },
      { name: 'Scooter elétrica', value: 9800, rarity: 'épico', icon: '🛵' },
      { name: 'Moto 0km', value: 20000, rarity: 'lendário', icon: '🏍️' },
    ],
  },
  {
    id: 'outfit',
    title: 'Outfit',
    tagline: 'Você com o melhor look',
    description:
      'Relógio de luxo, correntes, tênis raro e peças de grife. O maior teto de prêmio da plataforma.',
    maxPrize: 80000,
    price: 7.5,
    accent: 'gold',
    icon: '⌚',
    badge: { label: 'Lendária', tone: 'gold', icon: '👑' },
    categories: ['moda', 'luxo', 'super-premios'],
    hot: true,
    prizes: [
      { name: 'Camiseta grife', value: 590, rarity: 'comum', icon: '👕' },
      { name: 'Tênis edição limitada', value: 3400, rarity: 'raro', icon: '👟' },
      { name: 'Bolsa de grife', value: 18000, rarity: 'épico', icon: '👜' },
      { name: 'Relógio suíço', value: 80000, rarity: 'lendário', icon: '⌚' },
    ],
  },
  {
    id: 'me-mimei',
    title: 'Me Mimei',
    tagline: 'Presente pra você mesmo',
    description:
      'Maquiagem, perfumes, skincare e aquele carrinho cheio que você deixou salvo. Se mimar também é Natal.',
    maxPrize: 1000,
    price: 2.5,
    accent: 'candy',
    icon: '💄',
    categories: ['moda', 'natal'],
    prizes: [
      { name: 'Batom importado', value: 89, rarity: 'comum', icon: '💄' },
      { name: 'Kit skincare', value: 320, rarity: 'comum', icon: '🧴' },
      { name: 'Perfume importado', value: 650, rarity: 'raro', icon: '🌸' },
      { name: 'Kit completo de beleza', value: 1000, rarity: 'épico', icon: '💎' },
    ],
  },
  {
    id: 'maromba-e-fit',
    title: 'Maromba & Fit',
    tagline: 'Do suplemento à academia',
    description:
      'Whey, creatina, garrafa térmica e um ano de academia. O shape dos sonhos a uma raspadinha de distância.',
    maxPrize: 300,
    price: 1,
    accent: 'pine',
    icon: '🏋️',
    badge: { label: 'Desde R$ 1', tone: 'pine', icon: '🎯' },
    categories: ['natal'],
    prizes: [
      { name: 'Coqueteleira', value: 45, rarity: 'comum', icon: '🥤' },
      { name: 'Creatina 300g', value: 120, rarity: 'comum', icon: '🥛' },
      { name: 'Whey 900g', value: 220, rarity: 'raro', icon: '💪' },
      { name: '1 ano de academia', value: 300, rarity: 'épico', icon: '🏋️' },
    ],
  },
  {
    id: 'noel-da-sorte',
    title: 'Noel da Sorte',
    tagline: 'O bom velhinho tá generoso',
    description:
      'A raspadinha oficial do evento de Natal. Prêmios exclusivos que só existem em dezembro.',
    maxPrize: 10000,
    price: 4,
    accent: 'red',
    icon: '🎅',
    badge: { label: 'Só no Natal', tone: 'red', icon: '🎄' },
    categories: ['natal', 'super-premios', 'dinheiro'],
    hot: true,
    prizes: [
      { name: 'Meia do Noel (R$ 50)', value: 50, rarity: 'comum', icon: '🧦' },
      { name: 'Cesta de Natal', value: 400, rarity: 'comum', icon: '🧺' },
      { name: 'Smart TV 55 pol', value: 2600, rarity: 'raro', icon: '📺' },
      { name: 'Ceia dos sonhos + R$ 5.000', value: 6000, rarity: 'épico', icon: '🎁' },
      { name: 'Trenó do Noel', value: 10000, rarity: 'lendário', icon: '🛷' },
    ],
  },
  {
    id: 'natal-gamer',
    title: 'Natal Gamer',
    tagline: 'PS5, Xbox e o setup todo',
    description:
      'Console novo, jogo lacrado, controle extra e cadeira gamer. O presente que a criança de 30 anos quer.',
    maxPrize: 6800,
    price: 3,
    accent: 'royal',
    icon: '🎮',
    categories: ['games', 'tecnologia'],
    prizes: [
      { name: 'Jogo lacrado', value: 299, rarity: 'comum', icon: '💿' },
      { name: 'Controle extra', value: 480, rarity: 'comum', icon: '🎮' },
      { name: 'Cadeira gamer', value: 1800, rarity: 'raro', icon: '🪑' },
      { name: 'PlayStation 5 Pro', value: 6800, rarity: 'lendário', icon: '🕹️' },
    ],
  },
  {
    id: 'christmas-gold',
    title: 'Christmas Gold',
    tagline: 'Só entra quem é nível 5',
    description:
      'A sala VIP do Natal Premiado. Prêmios premium, joias, viagem e barra de ouro. Desbloqueia no nível 5.',
    maxPrize: 50000,
    price: 15,
    accent: 'gold',
    icon: '👑',
    badge: { label: 'VIP', tone: 'gold', icon: '🔒' },
    categories: ['luxo', 'super-premios', 'natal'],
    lockedAtLevel: 5,
    prizes: [
      { name: 'Colar de ouro', value: 4200, rarity: 'raro', icon: '📿' },
      { name: 'Viagem de fim de ano', value: 15000, rarity: 'épico', icon: '✈️' },
      { name: 'Barra de ouro 250g', value: 50000, rarity: 'lendário', icon: '🥇' },
    ],
  },
];

export const getScratchCard = (id: string) => scratchCards.find((card) => card.id === id);

export const relatedScratchCards = (id: string, limit = 4) =>
  scratchCards.filter((card) => card.id !== id).slice(0, limit);
