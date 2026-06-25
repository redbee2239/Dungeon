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

  // Magic Weapons (Mage/Cleric)
  magic_wand: {
    id: 'magic_wand',
    name: 'Gậy phép Cơ Bản',
    emoji: '🪄',
    type: 'weapon',
    rarity: 'common',
    description: 'Gậy phép cho người mới.',
    stats: { attack: 4, mp: 10 },
    price: 30,
    sellPrice: 12
  },
  oak_staff: {
    id: 'oak_staff',
    name: 'Gậy Sồi',
    emoji: '🪄',
    type: 'weapon',
    rarity: 'common',
    description: 'Gậy làm từ gỗ sồi.',
    stats: { attack: 6, mp: 15 },
    price: 60,
    sellPrice: 25
  },
  arcane_rod: {
    id: 'arcane_rod',
    name: 'Gậy Bí Thuật',
    emoji: '✨',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Gậy mang năng lượng bí thuật.',
    stats: { attack: 10, mp: 25 },
    price: 150,
    sellPrice: 70
  },
  crystal_staff: {
    id: 'crystal_staff',
    name: 'Gậy Pha Lê',
    emoji: '🔮',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Gậy pha lê phát sáng.',
    stats: { attack: 12, mp: 30 },
    price: 200,
    sellPrice: 90
  },
  mage_staff: {
    id: 'mage_staff',
    name: 'Gậy Pháp Sư',
    emoji: '🌟',
    type: 'weapon',
    rarity: 'rare',
    description: 'Gậy của pháp sư lão luyện.',
    stats: { attack: 18, mp: 50 },
    price: 450,
    sellPrice: 220
  },
  holy_staff: {
    id: 'holy_staff',
    name: 'Gậy Thánh',
    emoji: '✝️',
    type: 'weapon',
    rarity: 'rare',
    description: 'Gậy mang sức mạnh thiêng liêng.',
    stats: { attack: 15, mp: 40, hp: 20 },
    price: 500,
    sellPrice: 240
  },
  arcane_staff: {
    id: 'arcane_staff',
    name: 'Gậy Nguyên Tố',
    emoji: '⚡',
    type: 'weapon',
    rarity: 'epic',
    description: 'Gậy kiểm soát nguyên tố.',
    stats: { attack: 25, mp: 80 },
    price: 1200,
    sellPrice: 600
  },
  divine_staff: {
    id: 'divine_staff',
    name: 'Gậy Thần Thánh',
    emoji: '💫',
    type: 'weapon',
    rarity: 'epic',
    description: 'Gậy của thần linh.',
    stats: { attack: 22, mp: 60, hp: 40 },
    price: 1300,
    sellPrice: 650
  },
  archmage_staff: {
    id: 'archmage_staff',
    name: 'Gậy Đại Pháp Sư',
    emoji: '🌌',
    type: 'weapon',
    rarity: 'legendary',
    description: 'Gậy của đại pháp sư.',
    stats: { attack: 40, mp: 120, speed: 5 },
    price: 4500,
    sellPrice: 2200
  },
  staff_of_eternity: {
    id: 'staff_of_eternity',
    name: 'Gậy Vĩnh Hằng',
    emoji: '∞',
    type: 'weapon',
    rarity: 'legendary',
    description: 'Gậy bất tử từ thời cổ đại.',
    stats: { attack: 35, mp: 150, hp: 50 },
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
  },

  // More Weapons
  bronze_axe: {
    id: 'bronze_axe',
    name: 'Rìu Đồng',
    emoji: '🪓',
    type: 'weapon',
    rarity: 'common',
    description: 'Rìu đồng bền bỉ.',
    stats: { attack: 6 },
    price: 50,
    sellPrice: 20
  },
  silver_blade: {
    id: 'silver_blade',
    name: 'Kiếm Bạc',
    emoji: '⚔️',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Kiếm bạc sáng bóng.',
    stats: { attack: 12 },
    price: 150,
    sellPrice: 70
  },
  crystal_wand: {
    id: 'crystal_wand',
    name: 'Gậy Pha Lê',
    emoji: '🪄',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Gậy phép thuật pha lê.',
    stats: { attack: 10, mp: 20 },
    price: 180,
    sellPrice: 85
  },
  thunder_hammer: {
    id: 'thunder_hammer',
    name: 'Búa Sấm Sét',
    emoji: '🔨',
    type: 'weapon',
    rarity: 'rare',
    description: 'Búa mang sức mạnh sấm sét.',
    stats: { attack: 28, speed: -2 },
    price: 550,
    sellPrice: 270
  },
  ice_staff: {
    id: 'ice_staff',
    name: 'Gậy Băng Giá',
    emoji: '🧊',
    type: 'weapon',
    rarity: 'rare',
    description: 'Gậy phép thuật băng giá.',
    stats: { attack: 22, mp: 40 },
    price: 600,
    sellPrice: 290
  },
  void_scythe: {
    id: 'void_scythe',
    name: 'Liềm Hư Không',
    emoji: '💀',
    type: 'weapon',
    rarity: 'epic',
    description: 'Liềm từ hư không.',
    stats: { attack: 40, speed: 5 },
    price: 1500,
    sellPrice: 750
  },
  holy_lance: {
    id: 'holy_lance',
    name: 'Thương Thánh',
    emoji: '⚜️',
    type: 'weapon',
    rarity: 'epic',
    description: 'Thương mang sức mạnh thiêng liêng.',
    stats: { attack: 38, hp: 30 },
    price: 1400,
    sellPrice: 700
  },
  celestial_bow: {
    id: 'celestial_bow',
    name: 'Cung Thiên Hà',
    emoji: '🏹',
    type: 'weapon',
    rarity: 'legendary',
    description: 'Cung bắn tên từ thiên hà.',
    stats: { attack: 45, speed: 10 },
    price: 4800,
    sellPrice: 2400
  },

  // More Armor
  chain_vest: {
    id: 'chain_vest',
    name: 'Áo Xích Ngắn',
    emoji: '🦺',
    type: 'armor',
    rarity: 'common',
    description: 'Áo xích nhẹ.',
    stats: { defense: 5 },
    price: 45,
    sellPrice: 18
  },
  knight_armor: {
    id: 'knight_armor',
    name: 'Giáp Hiệp Sĩ',
    emoji: '🛡️',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Giáp của hiệp sĩ.',
    stats: { defense: 12, hp: 10 },
    price: 160,
    sellPrice: 75
  },
  mithril_armor: {
    id: 'mithril_armor',
    name: 'Giáp Mithril',
    emoji: '🛡️',
    type: 'armor',
    rarity: 'rare',
    description: 'Giáp làm từ mithril.',
    stats: { defense: 22, speed: -1 },
    price: 420,
    sellPrice: 200
  },
  obsidian_plate: {
    id: 'obsidian_plate',
    name: 'Giáp Obsidian',
    emoji: '🖤',
    type: 'armor',
    rarity: 'epic',
    description: 'Giáp làm từ đá obsidian.',
    stats: { defense: 35, hp: 40, speed: -4 },
    price: 1100,
    sellPrice: 550
  },
  phoenix_robe: {
    id: 'phoenix_robe',
    name: 'Áo Choàng Phượng Hoàng',
    emoji: '🔥',
    type: 'armor',
    rarity: 'legendary',
    description: 'Áo choàng bất tử.',
    stats: { defense: 45, hp: 80, speed: 5 },
    price: 5500,
    sellPrice: 2700
  },

  // More Accessories
  iron_ring: {
    id: 'iron_ring',
    name: 'Nhẫn Sắt',
    emoji: '💍',
    type: 'accessory',
    rarity: 'common',
    description: 'Nhẫn sắt đơn giản.',
    stats: { defense: 2 },
    price: 30,
    sellPrice: 12
  },
  lucky_charm: {
    id: 'lucky_charm',
    name: 'Bùa May Mắn',
    emoji: '🍀',
    type: 'accessory',
    rarity: 'uncommon',
    description: 'Tăng khả năng né tránh.',
    stats: { speed: 8 },
    price: 200,
    sellPrice: 90
  },
  life_pendant: {
    id: 'life_pendant',
    name: 'Dây Chuyền Sự Sống',
    emoji: '💚',
    type: 'accessory',
    rarity: 'rare',
    description: 'Tăng HP đáng kể.',
    stats: { hp: 50 },
    price: 500,
    sellPrice: 240
  },
  mana_crystal: {
    id: 'mana_crystal',
    name: 'Pha Lê Mana',
    emoji: '🔮',
    type: 'accessory',
    rarity: 'rare',
    description: 'Tăng MP đáng kể.',
    stats: { mp: 50 },
    price: 480,
    sellPrice: 230
  },
  warrior_emblem: {
    id: 'warrior_emblem',
    name: 'Huy Hiệu Chiến Binh',
    emoji: '🎖️',
    type: 'accessory',
    rarity: 'epic',
    description: 'Tăng ATK và HP.',
    stats: { attack: 15, hp: 40 },
    price: 1200,
    sellPrice: 600
  },
  shadow_cloak: {
    id: 'shadow_cloak',
    name: 'Áo Choàng Bóng Tối',
    emoji: '🌑',
    type: 'accessory',
    rarity: 'epic',
    description: 'Tăng SPD đáng kể.',
    stats: { speed: 15, attack: 5 },
    price: 1300,
    sellPrice: 650
  },
  divine_crown: {
    id: 'divine_crown',
    name: 'Vương Miện Thiêng Liêng',
    emoji: '👑',
    type: 'accessory',
    rarity: 'legendary',
    description: 'Vương miện của thần linh.',
    stats: { attack: 20, defense: 15, hp: 60, mp: 30 },
    price: 6000,
    sellPrice: 3000
  },

  // More Potions
  mana_mega: {
    id: 'mana_mega',
    name: 'Bình Mana Lớn',
    emoji: '💧',
    type: 'potion',
    rarity: 'uncommon',
    description: 'Hồi 80 MP.',
    healAmount: 80,
    price: 80,
    sellPrice: 35
  },
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    emoji: '✨',
    type: 'potion',
    rarity: 'rare',
    description: 'Hồi 200 HP và 100 MP.',
    healAmount: 200,
    price: 250,
    sellPrice: 120
  },
  phoenix_tear: {
    id: 'phoenix_tear',
    name: 'Nước Mắt Phượng Hoàng',
    emoji: '🩸',
    type: 'potion',
    rarity: 'epic',
    description: 'Hồi full HP.',
    healAmount: 9999,
    price: 800,
    sellPrice: 400
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
