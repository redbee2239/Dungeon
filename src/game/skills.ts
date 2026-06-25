export type SkillRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Skill {
  id: string;
  name: string;
  emoji: string;
  description: string;
  manaCost: number;
  damage: number;
  heal?: number;
  unlockLevel: number;
  class: string;
  rarity: SkillRarity;
  gachaRate: number;
}

export const SKILL_RARITY_NAMES: Record<SkillRarity, string> = {
  common: 'Phổ Thông',
  uncommon: 'Ưu Viên',
  rare: 'Hiếm',
  epic: 'Sử Thi',
  legendary: 'Huyền Thoại'
};

export const SKILL_RARITY_COLORS: Record<SkillRarity, number> = {
  common: 0x808080,
  uncommon: 0x1EFF00,
  rare: 0x0070DD,
  epic: 0xA335EE,
  legendary: 0xFF8000
};

export const SKILLS: Skill[] = [
  // Starting Skills (Level 1)
  {
    id: 'basic_slash',
    name: 'Chém Cơ Bản',
    emoji: '⚔️',
    description: 'Đòn chém cơ bản.',
    manaCost: 5,
    damage: 1.2,
    unlockLevel: 1,
    class: 'warrior',
    rarity: 'common',
    gachaRate: 0
  },
  {
    id: 'spark',
    name: 'Tia Sét',
    emoji: '⚡',
    description: 'Bắn tia sét nhỏ.',
    manaCost: 12,
    damage: 1.6,
    unlockLevel: 1,
    class: 'mage',
    rarity: 'common',
    gachaRate: 0
  },
  {
    id: 'quick_strike',
    name: 'Đánh Nhanh',
    emoji: '🗡️',
    description: 'Đòn đánh nhanh.',
    manaCost: 6,
    damage: 1.1,
    unlockLevel: 1,
    class: 'rogue',
    rarity: 'common',
    gachaRate: 0
  },
  {
    id: 'holy_smite',
    name: 'Đánh Thánh',
    emoji: '✨',
    description: 'Đánh bằng sức mạnh thánh.',
    manaCost: 12,
    damage: 1.6,
    unlockLevel: 1,
    class: 'cleric',
    rarity: 'common',
    gachaRate: 0
  },
  {
    id: 'battle_cry',
    name: 'Tiếng Thét Chiến Trường',
    emoji: '🏟️',
    description: 'Tiếng thét tăng sức mạnh chiến đấu.',
    manaCost: 5,
    damage: 1.3,
    unlockLevel: 1,
    class: 'gladiator',
    rarity: 'common',
    gachaRate: 0
  },

  // Warrior skills
  {
    id: 'power_strike',
    name: 'Đánh Mạnh',
    emoji: '💥',
    description: 'Đòn đánh mạnh gây 150% sát thương.',
    manaCost: 10,
    damage: 1.5,
    unlockLevel: 3,
    class: 'warrior',
    rarity: 'common',
    gachaRate: 0.4
  },
  {
    id: 'shield_bash',
    name: 'Đập Khiên',
    emoji: '🛡️',
    description: 'Đập khiên vào kẻ thù, gây choáng.',
    manaCost: 20,
    damage: 1.2,
    unlockLevel: 6,
    class: 'warrior',
    rarity: 'uncommon',
    gachaRate: 0.3
  },
  {
    id: 'war_cry',
    name: 'Tiếng Thét Chiến Tranh',
    emoji: '📯',
    description: 'Tăng tạm thời ATK 50%.',
    manaCost: 25,
    damage: 0,
    unlockLevel: 10,
    class: 'warrior',
    rarity: 'rare',
    gachaRate: 0.2
  },
  {
    id: 'whirlwind',
    name: 'Xoay Vortex',
    emoji: '🌪️',
    description: 'Tấn công toàn bộ quái.',
    manaCost: 35,
    damage: 2.0,
    unlockLevel: 15,
    class: 'warrior',
    rarity: 'epic',
    gachaRate: 0.08
  },

  // Mage skills
  {
    id: 'fireball',
    name: 'Quả Cầu Lửa',
    emoji: '🔥',
    description: 'Bắn quả cầu lửa gây sát thương phép.',
    manaCost: 22,
    damage: 2.5,
    unlockLevel: 3,
    class: 'mage',
    rarity: 'common',
    gachaRate: 0.4
  },
  {
    id: 'ice_shard',
    name: 'Mảnh Băng',
    emoji: '❄️',
    description: 'Mảnh băng xuyên giáp.',
    manaCost: 30,
    damage: 2.3,
    unlockLevel: 6,
    class: 'mage',
    rarity: 'uncommon',
    gachaRate: 0.3
  },
  {
    id: 'heal',
    name: 'Hồi Phục',
    emoji: '💚',
    description: 'Hồi phục HP cho bản thân.',
    manaCost: 25,
    damage: 0,
    heal: 80,
    unlockLevel: 8,
    class: 'mage',
    rarity: 'rare',
    gachaRate: 0.2
  },
  {
    id: 'meteor',
    name: 'Thiên Thạch',
    emoji: '☄️',
    description: 'Gọi thiên thạch gây sát thương lớn.',
    manaCost: 70,
    damage: 4.5,
    unlockLevel: 15,
    class: 'mage',
    rarity: 'epic',
    gachaRate: 0.08
  },

  // Rogue skills
  {
    id: 'backstab',
    name: 'Đâm Lén',
    emoji: '🗡️',
    description: 'Đâm lén từ sau, chí mạng cao.',
    manaCost: 12,
    damage: 2.0,
    unlockLevel: 3,
    class: 'rogue',
    rarity: 'common',
    gachaRate: 0.4
  },
  {
    id: 'poison_blade',
    name: 'Dao Độc',
    emoji: '☠️',
    description: 'Tấn công gây poisoned.',
    manaCost: 18,
    damage: 1.4,
    unlockLevel: 6,
    class: 'rogue',
    rarity: 'uncommon',
    gachaRate: 0.3
  },
  {
    id: 'stealth',
    name: 'Tàng Hình',
    emoji: '👻',
    description: 'Tàng hình, né đòn tiếp theo.',
    manaCost: 22,
    damage: 0,
    unlockLevel: 10,
    class: 'rogue',
    rarity: 'rare',
    gachaRate: 0.2
  },
  {
    id: 'shadow_strike',
    name: 'Đánh Bóng Tối',
    emoji: '🌑',
    description: 'Đánh từ bóng tối, bỏ qua phòng thủ.',
    manaCost: 40,
    damage: 2.5,
    unlockLevel: 15,
    class: 'rogue',
    rarity: 'epic',
    gachaRate: 0.08
  },

  // Cleric skills
  {
    id: 'smite',
    name: 'Trừng Phạt',
    emoji: '⚡',
    description: 'Trừng phạt kẻ thù bằng sức mạnh thiêng liêng.',
    manaCost: 18,
    damage: 2.0,
    unlockLevel: 3,
    class: 'cleric',
    rarity: 'common',
    gachaRate: 0.4
  },
  {
    id: 'holy_heal',
    name: 'Hồi Máu Thánh',
    emoji: '✨',
    description: 'Hồi phục HP lớn.',
    manaCost: 20,
    damage: 0,
    heal: 120,
    unlockLevel: 5,
    class: 'cleric',
    rarity: 'uncommon',
    gachaRate: 0.3
  },
  {
    id: 'divine_shield',
    name: 'Khiên Thánh',
    emoji: '🛡️',
    description: 'Tăng DEF tạm thời.',
    manaCost: 18,
    damage: 0,
    unlockLevel: 8,
    class: 'cleric',
    rarity: 'rare',
    gachaRate: 0.2
  },
  {
    id: 'resurrection',
    name: 'Phục Sinh',
    emoji: '🌟',
    description: 'Hồi phục 100% HP.',
    manaCost: 45,
    damage: 0,
    heal: 999,
    unlockLevel: 15,
    class: 'cleric',
    rarity: 'epic',
    gachaRate: 0.08
  },

  // Gladiator skills
  {
    id: 'shield_charge',
    name: 'Tấn Công Khiên',
    emoji: '🛡️',
    description: 'Lao vào kẻ thù bằng khiên.',
    manaCost: 10,
    damage: 1.5,
    unlockLevel: 3,
    class: 'gladiator',
    rarity: 'common',
    gachaRate: 0.4
  },
  {
    id: 'cleave',
    name: 'Chém Xéo',
    emoji: '⚔️',
    description: 'Chém ngang gây sát thương lớn.',
    manaCost: 15,
    damage: 1.8,
    unlockLevel: 6,
    class: 'gladiator',
    rarity: 'uncommon',
    gachaRate: 0.3
  },
  {
    id: 'rally',
    name: 'Tập Hợp',
    emoji: '📯',
    description: 'Tăng DEF tạm thời.',
    manaCost: 20,
    damage: 0,
    unlockLevel: 10,
    class: 'gladiator',
    rarity: 'rare',
    gachaRate: 0.2
  },
  {
    id: 'arena_fury',
    name: 'Cơn Thịnh Nộ Đấu Trường',
    emoji: '🏟️',
    description: 'Tấn công toàn bộ kẻ thù trong đấu trường.',
    manaCost: 35,
    damage: 2.2,
    unlockLevel: 15,
    class: 'gladiator',
    rarity: 'epic',
    gachaRate: 0.08
  },

  // Legendary skills (cross-class)
  {
    id: 'dragon_breath',
    name: 'Hơi Thở Rồng',
    emoji: '🐉',
    description: 'Hơi thở rồng thiêu cháy mọi thứ.',
    manaCost: 60,
    damage: 4.0,
    unlockLevel: 20,
    class: 'warrior',
    rarity: 'legendary',
    gachaRate: 0.02
  },
  {
    id: 'arcane_blast',
    name: 'Bùng Nổ Pháp Thuật',
    emoji: '💫',
    description: 'Bùng nổ phép thuật cực mạnh.',
    manaCost: 70,
    damage: 5.0,
    unlockLevel: 20,
    class: 'mage',
    rarity: 'legendary',
    gachaRate: 0.02
  },
  {
    id: 'assassinate',
    name: 'Ám Sát',
    emoji: '💀',
    description: 'Đòn chí mạng致命.',
    manaCost: 55,
    damage: 6.0,
    unlockLevel: 20,
    class: 'rogue',
    rarity: 'legendary',
    gachaRate: 0.02
  },
  {
    id: 'divine_judgment',
    name: 'Phán Xét Thiêng Liêng',
    emoji: '⚖️',
    description: 'Phán xét của thần linh.',
    manaCost: 80,
    damage: 3.0,
    heal: 500,
    unlockLevel: 20,
    class: 'cleric',
    rarity: 'legendary',
    gachaRate: 0.02
  }
];

export function getSkillsForClass(className: string, level: number): Skill[] {
  return SKILLS.filter(s => s.class === className && s.unlockLevel <= level);
}

export function getRandomSkill(): Skill {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const skill of SKILLS) {
    cumulative += skill.gachaRate;
    if (roll <= cumulative) {
      return skill;
    }
  }
  
  return SKILLS[0];
}

export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find(s => s.id === id);
}
