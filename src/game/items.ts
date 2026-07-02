export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'limited';
export type ItemType = 'weapon' | 'armor' | 'potion' | 'accessory';
export type WeaponType = 'physical' | 'magic';
export type ItemClass = 'warrior' | 'mage' | 'rogue' | 'cleric' | 'gladiator' | 'summoner' | 'archer' | 'all';

export interface Item {
  id: string;
  name: string;
  emoji: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  weaponType?: WeaponType;
  classRestriction?: ItemClass[];
  stats?: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    speed?: number;
  };
  summonBoost?: number;
  healAmount?: number;
  buffStat?: string;
  buffAmount?: number;
  debuffStat?: string;
  debuffAmount?: number;
  price: number;
  sellPrice: number;
}

export const RARITY_COLORS: Record<ItemRarity, number> = {
  common: 0x808080,
  uncommon: 0x1EFF00,
  rare: 0x0070DD,
  epic: 0xA335EE,
  legendary: 0xFF8000,
  limited: 0xFF4500
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: 'Phổ Thông',
  uncommon: 'Thông Thường',
  rare: 'Hiếm',
  epic: 'Sử Thi',
  legendary: 'Huyền Thoại',
  limited: 'Limited'
};

export const ITEMS: Record<string, Item> = {
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Gỗ Gỗ',
    emoji: '🗡️',
    type: 'weapon',
    rarity: 'common',
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
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
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
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
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
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
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
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
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
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
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
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

  // === SUMMONER WEAPONS ===
  basic_staff: {
    id: 'basic_staff',
    name: 'Gậy Triệu Hồi Cơ Bản',
    emoji: '🔮',
    type: 'weapon',
    rarity: 'common',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy triệu hồi cho người mới.',
    stats: { attack: 4, mp: 10 },
    summonBoost: 5,
    price: 35,
    sellPrice: 14
  },
  wolf_staff: {
    id: 'wolf_staff',
    name: 'Gậy Sói',
    emoji: '🐺',
    type: 'weapon',
    rarity: 'common',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy triệu hồi sói.',
    stats: { attack: 6, mp: 15 },
    summonBoost: 10,
    price: 60,
    sellPrice: 25
  },
  beast_staff: {
    id: 'beast_staff',
    name: 'Gậy Thú Rừng',
    emoji: '🐻',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy triệu hồi thú rừng.',
    stats: { attack: 10, mp: 25 },
    summonBoost: 15,
    price: 150,
    sellPrice: 70
  },
  spirit_staff: {
    id: 'spirit_staff',
    name: 'Gậy Tinh Linh',
    emoji: '✨',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy mang năng lượng tinh linh.',
    stats: { attack: 12, mp: 30 },
    summonBoost: 20,
    price: 200,
    sellPrice: 90
  },
  beastmaster_staff: {
    id: 'beastmaster_staff',
    name: 'Gậy Thuần Thú',
    emoji: '🐾',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy của bậc thầy thuần thú.',
    stats: { attack: 18, mp: 40 },
    summonBoost: 30,
    price: 500,
    sellPrice: 240
  },
  void_staff_summon: {
    id: 'void_staff_summon',
    name: 'Gậy Hư Không Triệu Hồi',
    emoji: '🕳️',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy hút năng lượng từ hư không.',
    stats: { attack: 22, mp: 50 },
    summonBoost: 35,
    price: 650,
    sellPrice: 320
  },
  dragon_staff: {
    id: 'dragon_staff',
    name: 'Gậy Rồng Thiêng',
    emoji: '🐉',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy triệu hồi rồng thiêng.',
    stats: { attack: 28, mp: 60 },
    summonBoost: 45,
    price: 1500,
    sellPrice: 750
  },
  eternal_staff: {
    id: 'eternal_staff',
    name: 'Gậy Vĩnh Hằng Triệu Hồi',
    emoji: '♾️',
    type: 'weapon',
    rarity: 'legendary',
    weaponType: 'magic',
    classRestriction: ['summoner'],
    description: 'Gậy triệu hồi từ thời cổ đại.',
    stats: { attack: 35, mp: 80 },
    summonBoost: 60,
    price: 5000,
    sellPrice: 2500
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
  },

  // === BUFF POTIONS ===
  str_potion: {
    id: 'str_potion',
    name: 'Thuốc Lực',
    emoji: '💪',
    type: 'potion',
    rarity: 'uncommon',
    description: 'Tăng ATK +20 trong combat.',
    buffStat: 'attack',
    buffAmount: 20,
    price: 60,
    sellPrice: 25
  },
  def_potion: {
    id: 'def_potion',
    name: 'Thuốc Giáp',
    emoji: '🛡️',
    type: 'potion',
    rarity: 'uncommon',
    description: 'Tăng DEF +15 trong combat.',
    buffStat: 'defense',
    buffAmount: 15,
    price: 60,
    sellPrice: 25
  },
  spd_potion: {
    id: 'spd_potion',
    name: 'Thuốc Nhanh',
    emoji: '💨',
    type: 'potion',
    rarity: 'uncommon',
    description: 'Tăng SPD +10 trong combat.',
    buffStat: 'speed',
    buffAmount: 10,
    price: 60,
    sellPrice: 25
  },
  hp_potion: {
    id: 'hp_potion',
    name: 'Thuốc Bền',
    emoji: '❤️',
    type: 'potion',
    rarity: 'uncommon',
    description: 'Tăng HP +50 trong combat.',
    buffStat: 'hp',
    buffAmount: 50,
    price: 60,
    sellPrice: 25
  },
  berserk_potion: {
    id: 'berserk_potion',
    name: 'Thuốc Điên',
    emoji: '🔥',
    type: 'potion',
    rarity: 'rare',
    description: 'Tăng ATK +50, giảm DEF -10.',
    buffStat: 'attack',
    buffAmount: 50,
    debuffStat: 'defense',
    debuffAmount: -10,
    price: 150,
    sellPrice: 70
  },
  iron_skin: {
    id: 'iron_skin',
    name: 'Thuốc Da Sắt',
    emoji: '⬛',
    type: 'potion',
    rarity: 'rare',
    description: 'Tăng DEF +30, giảm SPD -5.',
    buffStat: 'defense',
    buffAmount: 30,
    debuffStat: 'speed',
    debuffAmount: -5,
    price: 150,
    sellPrice: 70
  },
  mega_str: {
    id: 'mega_str',
    name: 'Thuốc Lực Cực Mạnh',
    emoji: '⚡',
    type: 'potion',
    rarity: 'epic',
    description: 'Tăng ATK +100 trong combat.',
    buffStat: 'attack',
    buffAmount: 100,
    price: 400,
    sellPrice: 200
  },
  mega_def: {
    id: 'mega_def',
    name: 'Thuốc Giáp Cực Mạnh',
    emoji: '🏰',
    type: 'potion',
    rarity: 'epic',
    description: 'Tăng DEF +60 trong combat.',
    buffStat: 'defense',
    buffAmount: 60,
    price: 400,
    sellPrice: 200
  },
  exp_boost_potion: {
    id: 'exp_boost_potion',
    name: 'Thuốc Kinh Nghiệm',
    emoji: '📘',
    type: 'potion',
    rarity: 'epic',
    description: 'x2 kinh nghiệm trong 3 lần đánh. Thua không mất.',
    price: 500,
    sellPrice: 250
  },

  // === NEW PHYSICAL WEAPONS ===
  rusty_dagger: {
    id: 'rusty_dagger',
    name: 'Dao Gỉ',
    emoji: '🗡️',
    type: 'weapon',
    rarity: 'common',
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
    description: 'Dao cũ kỹ nhưng vẫn cắt được.',
    stats: { attack: 4, speed: 2 },
    price: 30,
    sellPrice: 12
  },
  battle_axe: {
    id: 'battle_axe',
    name: 'Rìu Chiến',
    emoji: '🪓',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'physical',
    classRestriction: ['warrior', 'gladiator'],
    description: 'Rìu nặng dùng trong chiến đấu.',
    stats: { attack: 14, speed: -1 },
    price: 170,
    sellPrice: 80
  },
  warhammer: {
    id: 'warhammer',
    name: 'Búa Chiến',
    emoji: '🔨',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'physical',
    classRestriction: ['warrior', 'gladiator'],
    description: 'Búa chiến tranh uy lực mạnh.',
    stats: { attack: 30, hp: 15 },
    price: 650,
    sellPrice: 320
  },
  executioner_blade: {
    id: 'executioner_blade',
    name: 'Kiếm Tử Hình',
    emoji: '⚔️',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
    description: 'Kiếm của đao phủ手, chí mạng cao.',
    stats: { attack: 38, speed: 6 },
    price: 1600,
    sellPrice: 800
  },
  blade_of_chaos: {
    id: 'blade_of_chaos',
    name: 'Kiếm Hỗn Độn',
    emoji: '🌀',
    type: 'weapon',
    rarity: 'legendary',
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
    description: 'Kiếm từ thời hỗn loạn, phá hủy mọi thứ.',
    stats: { attack: 55, speed: 8, hp: 20 },
    price: 6500,
    sellPrice: 3200
  },
  shadow_katana: {
    id: 'shadow_katana',
    name: 'Katana Bóng Tối',
    emoji: '🌑',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'physical',
    classRestriction: ['rogue'],
    description: 'Katana bóng tối, chém nhanh như chớp.',
    stats: { attack: 22, speed: 10 },
    price: 580,
    sellPrice: 280
  },
  venom_blade: {
    id: 'venom_blade',
    name: 'Kiếm Độc',
    emoji: '☠️',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'physical',
    classRestriction: ['rogue'],
    description: 'Kiếm tẩm độc, gây sát thương theo thời gian.',
    stats: { attack: 32, speed: 12 },
    price: 1500,
    sellPrice: 750
  },
  twin_fang: {
    id: 'twin_fang',
    name: 'Song Dao Nanh',
    emoji: '🗡️',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'physical',
    classRestriction: ['rogue'],
    description: 'Hai dao găm sắc bén.',
    stats: { attack: 10, speed: 8 },
    price: 160,
    sellPrice: 75
  },
  gladius: {
    id: 'gladius',
    name: 'Gladius',
    emoji: '⚔️',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'physical',
    classRestriction: ['gladiator'],
    description: 'Kiếm La Mã cổ điển.',
    stats: { attack: 13, defense: 3 },
    price: 180,
    sellPrice: 85
  },
  trident: {
    id: 'trident',
    name: 'Tam Xoa',
    emoji: '🔱',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'physical',
    classRestriction: ['gladiator'],
    description: 'Tam xoa của võ sĩ La Mã.',
    stats: { attack: 26, speed: 4, hp: 10 },
    price: 550,
    sellPrice: 270
  },
  colosseum_edge: {
    id: 'colosseum_edge',
    name: 'Lưỡi Đấu Trường',
    emoji: '🏟️',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'physical',
    classRestriction: ['gladiator'],
    description: 'Vũ khí huyền thoại của đấu trường.',
    stats: { attack: 42, defense: 8, hp: 25 },
    price: 1800,
    sellPrice: 900
  },

  // === BOW WEAPONS (Archer) ===
  short_bow: {
    id: 'short_bow',
    name: 'Cung Ngắn',
    emoji: '🏹',
    type: 'weapon',
    rarity: 'common',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung ngắn đơn giản.',
    stats: { attack: 5, speed: 3 },
    price: 35,
    sellPrice: 14
  },
  hunting_bow: {
    id: 'hunting_bow',
    name: 'Cung Săn',
    emoji: '🏹',
    type: 'weapon',
    rarity: 'common',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung dùng để săn thú.',
    stats: { attack: 8, speed: 4 },
    price: 70,
    sellPrice: 30
  },
  long_bow: {
    id: 'long_bow',
    name: 'Cung Dài',
    emoji: '🏹',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung dài bắn xa hơn.',
    stats: { attack: 14, speed: 5 },
    price: 180,
    sellPrice: 85
  },
  composite_bow: {
    id: 'composite_bow',
    name: 'Cung Tổng Hợp',
    emoji: '🏹',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung làm từ nhiều vật liệu.',
    stats: { attack: 16, speed: 6 },
    price: 220,
    sellPrice: 100
  },
  elm_bow: {
    id: 'elm_bow',
    name: 'Cung Gỗ Đào',
    emoji: '🏹',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung làm từ gỗ đàn hương.',
    stats: { attack: 22, speed: 8 },
    price: 500,
    sellPrice: 240
  },
  shadow_bow: {
    id: 'shadow_bow',
    name: 'Cung Bóng Tối',
    emoji: '🌑',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung mang năng lượng bóng tối.',
    stats: { attack: 26, speed: 10 },
    price: 600,
    sellPrice: 290
  },
  phoenix_bow: {
    id: 'phoenix_bow',
    name: 'Cung Phượng Hoàng',
    emoji: '🔥',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung bắn tên lửa phượng hoàng.',
    stats: { attack: 35, speed: 12 },
    price: 1500,
    sellPrice: 750
  },
  dragon_bow: {
    id: 'dragon_bow',
    name: 'Cung Rồng',
    emoji: '🐉',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'physical',
    classRestriction: ['archer'],
    description: 'Cung làm từ vảy rồng.',
    stats: { attack: 40, speed: 10, hp: 30 },
    price: 1800,
    sellPrice: 900
  },

  // === NEW MAGIC WEAPONS ===
  apprentice_wand: {
    id: 'apprentice_wand',
    name: 'Gậy Học Trò',
    emoji: '🪄',
    type: 'weapon',
    rarity: 'common',
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
    description: 'Gậy phép cho người học việc.',
    stats: { attack: 3, mp: 8 },
    price: 25,
    sellPrice: 10
  },
  runic_staff: {
    id: 'runic_staff',
    name: 'Gậy Chữ Runic',
    emoji: '📜',
    type: 'weapon',
    rarity: 'uncommon',
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
    description: 'Gậy khắc chữ cổ.',
    stats: { attack: 9, mp: 20 },
    price: 140,
    sellPrice: 65
  },
  elemental_wand: {
    id: 'elemental_wand',
    name: 'Gậy Nguyên Tố',
    emoji: '🌀',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'magic',
    classRestriction: ['mage'],
    description: 'Gậy kiểm soát nguyên tố.',
    stats: { attack: 20, mp: 45 },
    price: 480,
    sellPrice: 230
  },
  dark_staff: {
    id: 'dark_staff',
    name: 'Gậy Bóng Tối',
    emoji: '🌑',
    type: 'weapon',
    rarity: 'rare',
    weaponType: 'magic',
    classRestriction: ['mage'],
    description: 'Gậy mang năng lượng bóng tối.',
    stats: { attack: 24, mp: 35, speed: 3 },
    price: 520,
    sellPrice: 250
  },
  sun_goddess_wand: {
    id: 'sun_goddess_wand',
    name: 'Gậy Nữ Thần Mặt Trời',
    emoji: '☀️',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'magic',
    classRestriction: ['cleric'],
    description: 'Gậy của nữ thần mặt trời, chữa lành mạnh.',
    stats: { attack: 28, mp: 70, hp: 50 },
    price: 1400,
    sellPrice: 700
  },
  void_staff: {
    id: 'void_staff',
    name: 'Gậy Hư Không',
    emoji: '🕳️',
    type: 'weapon',
    rarity: 'epic',
    weaponType: 'magic',
    classRestriction: ['mage'],
    description: 'Gậy hút năng lượng từ hư không.',
    stats: { attack: 30, mp: 90, speed: 3 },
    price: 1600,
    sellPrice: 800
  },
  celestial_staff: {
    id: 'celestial_staff',
    name: 'Gậy Thiên Thân',
    emoji: '🌌',
    type: 'weapon',
    rarity: 'legendary',
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
    description: 'Gậy của chúa tể thiên hà.',
    stats: { attack: 45, mp: 140, hp: 40, speed: 5 },
    price: 6000,
    sellPrice: 3000
  },

  // === NEW ARMOR ===
  shadow_cloak_armor: {
    id: 'shadow_cloak_armor',
    name: 'Áo Choàng Bóng Tối',
    emoji: '🌑',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Áo choàng giúp tàng hình.',
    stats: { defense: 10, speed: 5 },
    price: 200,
    sellPrice: 90
  },
  mage_robe: {
    id: 'mage_robe',
    name: 'Áo Choàng Pháp Sư',
    emoji: '🧙',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Áo choàng tăng năng lượng phép.',
    stats: { defense: 8, mp: 30 },
    price: 180,
    sellPrice: 85
  },
  paladin_armor: {
    id: 'paladin_armor',
    name: 'Giáp Thánh Kỵ Sĩ',
    emoji: '🛡️',
    type: 'armor',
    rarity: 'rare',
    description: 'Giáp của thánh kỵ sĩ.',
    stats: { defense: 28, hp: 30, mp: 15 },
    price: 600,
    sellPrice: 290
  },
  berserker_armor: {
    id: 'berserker_armor',
    name: 'Giáp Chiến Binh',
    emoji: '💢',
    type: 'armor',
    rarity: 'rare',
    description: 'Giáp tăng sát thương khi HP thấp.',
    stats: { defense: 20, attack: 8, hp: 15 },
    price: 550,
    sellPrice: 270
  },
  void_armor: {
    id: 'void_armor',
    name: 'Giáp Hư Không',
    emoji: '🕳️',
    type: 'armor',
    rarity: 'epic',
    description: 'Giáp từ chiều không gian khác.',
    stats: { defense: 38, hp: 50, speed: 2 },
    price: 1500,
    sellPrice: 750
  },
  celestial_plate: {
    id: 'celestial_plate',
    name: 'Giáp Thiên Hà',
    emoji: '🌌',
    type: 'armor',
    rarity: 'legendary',
    description: 'Giáp được rèn từ sao.',
    stats: { defense: 50, hp: 70, mp: 20, speed: 3 },
    price: 6000,
    sellPrice: 3000
  },

  // === NEW ACCESSORIES ===
  attack_ring: {
    id: 'attack_ring',
    name: 'Nhẫn Tấn Công',
    emoji: '💍',
    type: 'accessory',
    rarity: 'common',
    description: 'Nhẫn tăng tấn công nhỏ.',
    stats: { attack: 3 },
    price: 40,
    sellPrice: 15
  },
  defense_ring: {
    id: 'defense_ring',
    name: 'Nhẫn Phòng Thủ',
    emoji: '💍',
    type: 'accessory',
    rarity: 'common',
    description: 'Nhẫn tăng phòng thủ nhỏ.',
    stats: { defense: 3 },
    price: 40,
    sellPrice: 15
  },
  mage_ring: {
    id: 'mage_ring',
    name: 'Nhẫn Pháp Sư',
    emoji: '💍',
    type: 'accessory',
    rarity: 'uncommon',
    description: 'Nhẫn tăng MP.',
    stats: { mp: 30, attack: 3 },
    price: 200,
    sellPrice: 90
  },
  berserker_band: {
    id: 'berserker_band',
    name: 'Vòng Chiến Binh',
    emoji: '🔴',
    type: 'accessory',
    rarity: 'uncommon',
    description: 'Vòng tăng tấn công.',
    stats: { attack: 8, hp: -10 },
    price: 180,
    sellPrice: 85
  },
  guard_charm: {
    id: 'guard_charm',
    name: 'Bùa Bảo Vệ',
    emoji: '🛡️',
    type: 'accessory',
    rarity: 'uncommon',
    description: 'Bùa tăng phòng thủ.',
    stats: { defense: 8, hp: 15 },
    price: 190,
    sellPrice: 90
  },
  vampire_fang: {
    id: 'vampire_fang',
    name: 'Nanh Ma Cà Rồng',
    emoji: '🧛',
    type: 'accessory',
    rarity: 'rare',
    description: 'Hút máu khi tấn công.',
    stats: { attack: 12, hp: 30 },
    price: 550,
    sellPrice: 270
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Lông Phượng Hoàng',
    emoji: '🪶',
    type: 'accessory',
    rarity: 'rare',
    description: 'Tăng tốc và hồi phục.',
    stats: { speed: 12, hp: 20 },
    price: 520,
    sellPrice: 250
  },
  elemental_orb: {
    id: 'elemental_orb',
    name: 'Quả Cầu Nguyên Tố',
    emoji: '🔮',
    type: 'accessory',
    rarity: 'epic',
    description: 'Tăng sức mạnh nguyên tố.',
    stats: { attack: 12, mp: 40, speed: 5 },
    price: 1300,
    sellPrice: 650
  },
  blood_gem: {
    id: 'blood_gem',
    name: 'Ngọc Máu',
    emoji: '❤️',
    type: 'accessory',
    rarity: 'epic',
    description: 'Tăng HP và hồi phục.',
    stats: { hp: 80, defense: 5 },
    price: 1400,
    sellPrice: 700
  },
  moonstone_ring: {
    id: 'moonstone_ring',
    name: 'Nhẫn Đá Mặt Trăng',
    emoji: '🌙',
    type: 'accessory',
    rarity: 'legendary',
    description: 'Nhẫn huyền thoại tăng mọi chỉ số.',
    stats: { attack: 10, defense: 10, hp: 30, mp: 30, speed: 8 },
    price: 5500,
    sellPrice: 2700
  },

  // === LIMITED SUMMER WEAPONS ===
  summer_blade: {
    id: 'summer_blade',
    name: 'Kiếm Mùa Hè',
    emoji: '☀️',
    type: 'weapon',
    rarity: 'limited',
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
    description: 'Vũ khí limited - Sức mạnh của mùa hè!',
    stats: { attack: 52, hp: 40, speed: 10 },
    price: 0,
    sellPrice: 0
  },
  summer_staff: {
    id: 'summer_staff',
    name: 'Gậy Mùa Hè',
    emoji: '🌊',
    type: 'weapon',
    rarity: 'limited',
    weaponType: 'magic',
    classRestriction: ['mage', 'cleric'],
    description: 'Vũ khí limited - Sức mạnh đại dương!',
    stats: { attack: 42, mp: 160, speed: 8 },
    price: 0,
    sellPrice: 0
  },
  summer_bow: {
    id: 'summer_bow',
    name: 'Cung Mùa Hè',
    emoji: '🌺',
    type: 'weapon',
    rarity: 'limited',
    weaponType: 'physical',
    classRestriction: ['warrior', 'rogue', 'gladiator'],
    description: 'Vũ khí limited - Tốc độ如风!',
    stats: { attack: 45, speed: 18, hp: 20 },
    price: 0,
    sellPrice: 0
  },
  summer_dagger: {
    id: 'summer_dagger',
    name: 'Dao Mùa Hè',
    emoji: '🐚',
    type: 'weapon',
    rarity: 'limited',
    weaponType: 'physical',
    classRestriction: ['rogue'],
    description: 'Vũ khí limited - Sát thủ biển!',
    stats: { attack: 48, speed: 20, hp: 15 },
    price: 0,
    sellPrice: 0
  },
  summer_hammer: {
    id: 'summer_hammer',
    name: 'Búa Mùa Hè',
    emoji: '🦀',
    type: 'weapon',
    rarity: 'limited',
    weaponType: 'physical',
    classRestriction: ['warrior', 'gladiator'],
    description: 'Vũ khí limited - Sức mạnh cua!',
    stats: { attack: 55, hp: 50, defense: 8 },
    price: 0,
    sellPrice: 0
  },
  summer_ring: {
    id: 'summer_ring',
    name: 'Nhẫn Mùa Hè',
    emoji: '🐚',
    type: 'accessory',
    rarity: 'limited',
    description: 'Phụ kiện limited - Blessing of Summer!',
    stats: { attack: 12, defense: 12, hp: 40, mp: 40, speed: 10 },
    price: 0,
    sellPrice: 0
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
