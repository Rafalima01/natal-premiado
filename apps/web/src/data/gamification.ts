import type { Mission, Player, PlayerBadge, RankingRow, Transaction } from './types';

/** Jogador mockado. Nada aqui persiste — é só para vestir a interface. */
export const player: Player = {
  name: 'Rafael Nogueira',
  handle: '@rafa',
  level: 4,
  title: 'Duende Sortudo',
  xp: 1840,
  xpToNext: 2500,
  coins: 1250,
  streak: 6,
  giftsCollected: 3,
  giftsTotal: 10,
  balance: 137.5,
  bonusBalance: 50,
  memberSince: 'Dezembro de 2025',
};

export const levelTitles = [
  'Novato do Trenó',
  'Ajudante do Noel',
  'Duende Aprendiz',
  'Duende Sortudo',
  'Guardião do Presente',
  'Mestre do Natal',
];

export const missions: Mission[] = [
  {
    id: 'm1',
    title: 'Raspe 3 cartelas hoje',
    description: 'Qualquer raspadinha vale. O contador zera à meia-noite.',
    progress: 2,
    goal: 3,
    reward: '+150 XP',
    icon: '🎟️',
    accent: 'gold',
  },
  {
    id: 'm2',
    title: 'Abra o presente do dia',
    description: 'Um presente novo aparece a cada 24 horas.',
    progress: 1,
    goal: 1,
    reward: '+80 moedas',
    icon: '🎁',
    accent: 'red',
    done: true,
  },
  {
    id: 'm3',
    title: 'Experimente 2 categorias',
    description: 'Jogue em categorias diferentes na mesma semana.',
    progress: 1,
    goal: 2,
    reward: '+200 XP',
    icon: '🧭',
    accent: 'ice',
  },
  {
    id: 'm4',
    title: 'Sequência de 7 dias',
    description: 'Entre todo dia para manter o combo de Natal aceso.',
    progress: 6,
    goal: 7,
    reward: 'Badge Estrela do Topo',
    icon: '🔥',
    accent: 'ember',
  },
];

export const playerBadges: PlayerBadge[] = [
  { id: 'b1', name: 'Primeira Raspada', icon: '🎟️', accent: 'gold', unlocked: true, hint: 'Jogue sua primeira cartela' },
  { id: 'b2', name: 'Caça-Presente', icon: '🎁', accent: 'red', unlocked: true, hint: 'Abra 5 presentes do dia' },
  { id: 'b3', name: 'Duende Fiel', icon: '🧝', accent: 'pine', unlocked: true, hint: 'Mantenha 5 dias de sequência' },
  { id: 'b4', name: 'Sorte Grande', icon: '🍀', accent: 'ice', unlocked: true, hint: 'Ganhe um prêmio raro' },
  { id: 'b5', name: 'Estrela do Topo', icon: '⭐', accent: 'gold', unlocked: false, hint: 'Complete 7 dias seguidos' },
  { id: 'b6', name: 'Rei do Natal', icon: '👑', accent: 'candy', unlocked: false, hint: 'Chegue ao nível 6' },
];

export const ranking: RankingRow[] = [
  { position: 1, name: 'Beatriz S*****', level: 9, points: 48200, accent: 'gold' },
  { position: 2, name: 'Diego A*****', level: 8, points: 41750, accent: 'ice' },
  { position: 3, name: 'Camila R*****', level: 8, points: 39400, accent: 'candy' },
  { position: 4, name: 'Thiago N*****', level: 7, points: 31100, accent: 'ember' },
  { position: 5, name: 'Você', level: 4, points: 18400, accent: 'red', isPlayer: true },
  { position: 6, name: 'Letícia P*****', level: 4, points: 17250, accent: 'pine' },
  { position: 7, name: 'João F*****', level: 3, points: 12900, accent: 'royal' },
];

/** Presentes do calendário do evento de Natal. */
export const eventGifts = Array.from({ length: 10 }, (_, index) => ({
  day: index + 1,
  collected: index < 3,
  today: index === 3,
  reward: [
    '+50 moedas',
    '1 raspadinha grátis',
    '+120 XP',
    'Caixa surpresa',
    '+200 moedas',
    'Raspadinha VIP',
    '+300 XP',
    'Badge exclusiva',
    '2 raspadinhas grátis',
    'Prêmio lendário',
  ][index],
}));

export const transactions: Transaction[] = [
  { id: 't1', type: 'premio', label: 'Prêmio — PIX na Conta', value: 100, date: '24 dez, 21:14', status: 'concluido' },
  { id: 't2', type: 'compra', label: 'Raspadinha — Noel da Sorte', value: -4, date: '24 dez, 21:12', status: 'concluido' },
  { id: 't3', type: 'bonus', label: 'Bônus de Natal 100%', value: 50, date: '24 dez, 19:02', status: 'concluido' },
  { id: 't4', type: 'deposito', label: 'Depósito via PIX', value: 50, date: '24 dez, 19:01', status: 'concluido' },
  { id: 't5', type: 'compra', label: 'Pacote — Caixa do Noel', value: -25, date: '23 dez, 15:40', status: 'concluido' },
  { id: 't6', type: 'saque', label: 'Saque para chave PIX', value: -80, date: '22 dez, 10:22', status: 'pendente' },
];
