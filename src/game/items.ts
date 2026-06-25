export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'potion' | 'accessory';

export interface Item {
  id: string;
  name: string;
  emoji: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  stats?: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    speed?: number;
  };
  healAmount?: number;
  price: number;
  sellPrice: number;
}

export const RARITY_COLORS: Record<ItemRarity, number> = {
  common: 0x808080,
  uncommon: 0x1EFF00,
  rare: 0x0070DD,
  epic: 0xA335EE,
  legendary: 0xFF8000
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: 'Phổ Thông',
  uncommon: 'Thông Thường',
  rare: 'Hiếm',
  epic: 'Sử Thi',
  legendary: 'Huyền Thoại'
};

export const ITEMS: Record<string, Item> = {
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Gỗ Gỗ',
    emoji: '🗡️',
    type: 'weapon',
    rarity: 'common',
    description: 'Một thanh kiếm gỗ đơn giản.',
    stats: { attack: 3 },
    price: 25,
    sellPrice: 10
  },
  iron_sword: {
    id: 'iron_sword',
    name: 'Kiếm Sắt',
    emoji: '⚔️',
    type: 'weapon',
    rarity: 'common',
    description: 'Kiếm sắt chắc chắn.',
    stats: { attack: 8 },
    price: 80,
    sellPrice: 35
  },
  steel_sword: {
    id: 'steel_sword',
    name: 'Kiếm Thép',
    emoji: '⚔️',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Kiếm thép sắc bén.',
    stats: { attack: 15 },
    price: 200,
    sellPrice: 90
  },
  flame_blade: {
    id: 'flame_blade',
    name: 'Lưỡi Lửa',
    emoji: '🔥',
    type: 'weapon',
    rarity: 'rare',
    description: 'Kiếm bao bọc trong lửa.',
    stats: { attack: 25, speed: 3 },
    price: 500,
    sellPrice: 250
  },
  shadow_dagger: {
    id: 'shadow_dagger',
    name: 'Dao Bóng Tối',
    emoji: '🌑',
    type: 'weapon',
    rarity: 'epic',
    description: 'Dao găm bóng tối, chí mạng cao.',
    stats: { attack: 35, speed: 8 },
    price: 1200,
    sellPrice: 600
  },
  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Thiết Giáp Rồng',
    emoji: '🐉',
    type: 'weapon',
    rarity: 'legendary',
    description: 'Vũ khí huyền thoại giết rồng.',
    stats: { attack: 50, hp: 30 },
    price: 5000,
    sellPrice: 2500
  },

  cloth_armor: {
    id: 'cloth_armor',
    name: 'Áo Vải',
    emoji: '👕',
    type: 'armor',
    rarity: 'common',
    description: 'Áo vải mỏng.',
    stats: { defense: 3 },
    price: 20,
    sellPrice: 8
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Áo Da',
    emoji: '🧥',
    type: 'armor',
    rarity: 'common',
    description: 'Áo da chắc chắn.',
    stats: { defense: 8 },
    price: 75,
    sellPrice: 30
  },
  chain_mail: {
    id: 'chain_mail',
    name: 'Áo Giáp Xích',
    emoji: '🛡️',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Áo giáp xích bền bỉ.',
    stats: { defense: 15, speed: -2 },
    price: 180,
    sellPrice: 80
  },
  plate_armor: {
    id: 'plate_armor',
    name: 'Áo Giáp Tấm',
    emoji: '🛡️',
    type: 'armor',
    rarity: 'rare',
    description: 'Áo giáp thép nặng.',
    stats: { defense: 25, hp: 20, speed: -3 },
    price: 450,
    sellPrice: 220
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'Vảy Rồng',
    emoji: '🐲',
    type: 'armor',
    rarity: 'legendary',
    description: 'Giáp làm từ vảy rồng.',
    stats: { defense: 40, hp: 50 },
    price: 4500,
    sellPrice: 2200
  },

  health_potion: {
    id: 'health_potion',
    name: 'Bình Máu',
    emoji: '🧪',
    type: 'potion',
    rarity: 'common',
    description: 'Hồi 50 HP.',
    healAmount: 50,
    price: 30,
    sellPrice: 12
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Bình Mana',
    emoji: '💧',
    type: 'potion',
    rarity: 'common',
    description: 'Hồi 30 MP.',
    healAmount: 30,
    price: 25,
    sellPrice: 10
  },
  mega_health: {
    id: 'mega_health',
    name: 'Bình Máu Lớn',
    emoji: '🧪',
    type: 'potion',
    rarity: 'uncommon',
    description: 'Hồi 150 HP.',
    healAmount: 150,
    price: 100,
    sellPrice: 45
  },

  speed_ring: {
    id: 'speed_ring',
    name: 'Nhẫn Tốc Độ',
    emoji: '💍',
    type: 'accessory',
    rarity: 'uncommon',
    description: 'Tăng tốc độ.',
    stats: { speed: 5 },
    price: 150,
    sellPrice: 70
  },
  power_amulet: {
    id: 'power_amulet',
    name: 'Dây Chuyền Sức Mạnh',
    emoji: '📿',
    type: 'accessory',
    rarity: 'rare',
    description: 'Tăng tấn công và HP.',
    stats: { attack: 10, hp: 25 },
    price: 400,
    sellPrice: 180
  }
};

export function getItemById(id: string): Item | undefined {
  return ITEMS[id];
}

export function getRandomDrop(monsterLevel: number): Item | null {
  const dropChance = Math.random();
  if (dropChance > 0.6) return null;

  const allItems = Object.values(ITEMS);
  const maxRarity = monsterLevel <= 5 ? 'uncommon' : monsterLevel <= 10 ? 'rare' : 'epic';
  
  const rarityOrder: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const maxIndex = rarityOrder.indexOf(maxRarity);
  
  const validItems = allItems.filter(item => {
    const idx = rarityOrder.indexOf(item.rarity);
    return idx <= maxIndex && item.type !== 'potion';
  });
  
  if (validItems.length === 0) return null;
  
  if (monsterLevel >= 15 && Math.random() < 0.05) {
    return validItems.find(i => i.rarity === 'legendary') || validItems[Math.floor(Math.random() * validItems.length)];
  }
  
  return validItems[Math.floor(Math.random() * validItems.length)];
}
