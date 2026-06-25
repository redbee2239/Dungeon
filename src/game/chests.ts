export type ChestRarity = 'common' | 'premium' | 'rare' | 'legendary';

export interface Chest {
  id: string;
  name: string;
  emoji: string;
  rarity: ChestRarity;
  description: string;
  gemMin: number;
  gemMax: number;
  goldMin: number;
  goldMax: number;
  dropRate: number;
}

export const CHEST_RARITY_NAMES: Record<ChestRarity, string> = {
  common: 'Thường',
  premium: 'Cao Cấp',
  rare: 'Hiếm',
  legendary: 'Huyền Thoại'
};

export const CHEST_RARITY_COLORS: Record<ChestRarity, number> = {
  common: 0x808080,
  premium: 0x1EFF00,
  rare: 0x0070DD,
  legendary: 0xFF8000
};

export const CHESTS: Record<ChestRarity, Chest> = {
  common: {
    id: 'common',
    name: 'Rương Thường',
    emoji: '📦',
    rarity: 'common',
    description: 'Rương đơn giản, phần thưởng cơ bản.',
    gemMin: 5,
    gemMax: 15,
    goldMin: 20,
    goldMax: 50,
    dropRate: 0.5
  },
  premium: {
    id: 'premium',
    name: 'Rương Cao Cấp',
    emoji: '🎁',
    rarity: 'premium',
    description: 'Rương cao cấp, phần thưởng tốt hơn.',
    gemMin: 20,
    gemMax: 50,
    goldMin: 50,
    goldMax: 150,
    dropRate: 0.3
  },
  rare: {
    id: 'rare',
    name: 'Rương Hiếm',
    emoji: '💎',
    rarity: 'rare',
    description: 'Rương hiếm, chứa nhiều gem.',
    gemMin: 50,
    gemMax: 120,
    goldMin: 100,
    goldMax: 300,
    dropRate: 0.15
  },
  legendary: {
    id: 'legendary',
    name: 'Rương Huyền Thoại',
    emoji: '👑',
    rarity: 'legendary',
    description: 'Rương huyền thoại, phần thưởng cực kỳ giá trị.',
    gemMin: 150,
    gemMax: 400,
    goldMin: 300,
    goldMax: 800,
    dropRate: 0.05
  }
};

export function rollChest(floor: number): Chest | null {
  const floorBonus = Math.min(floor * 0.02, 0.3);
  
  const roll = Math.random();
  
  if (roll < CHESTS.legendary.dropRate + floorBonus * 0.3) {
    return CHESTS.legendary;
  }
  if (roll < CHESTS.rare.dropRate + floorBonus * 0.5) {
    return CHESTS.rare;
  }
  if (roll < CHESTS.premium.dropRate + floorBonus) {
    return CHESTS.premium;
  }
  if (roll < CHESTS.common.dropRate) {
    return CHESTS.common;
  }
  
  return null;
}

export function openChest(chest: Chest): { gems: number; gold: number } {
  const gems = Math.floor(Math.random() * (chest.gemMax - chest.gemMin + 1)) + chest.gemMin;
  const gold = Math.floor(Math.random() * (chest.goldMax - chest.goldMin + 1)) + chest.goldMin;
  return { gems, gold };
}
