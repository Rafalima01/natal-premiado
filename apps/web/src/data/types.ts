/** Tipos do catálogo visual. Nesta etapa nada aqui vem de API — tudo é mock. */

export type Accent = 'gold' | 'pine' | 'ember' | 'ice' | 'royal' | 'candy' | 'red';

export type BadgeTone = 'gold' | 'red' | 'pine' | 'ember' | 'ice' | 'neutral';

export type Rarity = 'comum' | 'raro' | 'épico' | 'lendário';

export interface CardBadge {
  label: string;
  tone: BadgeTone;
  icon?: string;
}

export interface PrizeTierItem {
  name: string;
  value: number;
  rarity: Rarity;
  icon: string;
}

export interface ScratchCard {
  id: string;
  title: string;
  tagline: string;
  description: string;
  /** Prêmio máximo em BRL. */
  maxPrize: number;
  /** Preço por raspadinha em BRL. */
  price: number;
  accent: Accent;
  icon: string;
  badge?: CardBadge;
  categories: string[];
  prizes: PrizeTierItem[];
  /** Slot preparado para o asset definitivo (banner recortado do produto). */
  image?: string;
  hot?: boolean;
  /** Bloqueado por nível — usado para demonstrar o estado `disabled`. */
  lockedAtLevel?: number;
}

export interface Prize {
  id: string;
  name: string;
  category: string;
  value: number;
  rarity: Rarity;
  icon: string;
  accent: Accent;
  image?: string;
}

export interface PackageBox {
  id: string;
  title: string;
  subtitle: string;
  maxPrize: number;
  price: number;
  accent: Accent;
  icon: string;
  itemsIcons: string[];
  badge?: CardBadge;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  blurb: string;
  icon: string;
  accent: Accent;
  count: number;
}

export interface Winner {
  id: string;
  name: string;
  prize: string;
  value: number;
  icon: string;
  accent: Accent;
  minutesAgo: number;
}

export interface FeaturedCard {
  id: string;
  eyebrow: string;
  title: string;
  maxPrize: number;
  price: number;
  blurb: string;
  icon: string;
  accent: Accent;
  badge?: CardBadge;
  href: string;
  image?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  reward: string;
  icon: string;
  accent: Accent;
  done?: boolean;
}

export interface PlayerBadge {
  id: string;
  name: string;
  icon: string;
  accent: Accent;
  unlocked: boolean;
  hint: string;
}

export interface Player {
  name: string;
  handle: string;
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  coins: number;
  streak: number;
  giftsCollected: number;
  giftsTotal: number;
  balance: number;
  bonusBalance: number;
  memberSince: string;
}

export interface RankingRow {
  position: number;
  name: string;
  level: number;
  points: number;
  accent: Accent;
  isPlayer?: boolean;
}

export interface Transaction {
  id: string;
  type: 'deposito' | 'premio' | 'saque' | 'compra' | 'bonus';
  label: string;
  value: number;
  date: string;
  status: 'concluido' | 'pendente';
}
