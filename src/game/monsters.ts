import { ItemRarity } from './items';

export interface Monster {
  id: string;
  name: string;
  emoji: string;
  level: number;
  hp: number;
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  expReward: number;
  goldReward: number;
  description: string;
  isBoss: boolean;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  emoji: string;
  baseLevel: number;
  baseHP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  expReward: number;
  goldReward: number;
  description: string;
  isBoss: boolean;
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  {
    id: 'slime',
    name: 'Slime',
    emoji: '🟢',
    baseLevel: 1,
    baseHP: 30,
    baseAttack: 5,
    baseDefense: 2,
    baseSpeed: 3,
    expReward: 15,
    goldReward: 10,
    description: 'Quái vật gelatin yếu nhất.',
    isBoss: false
  },
  {
    id: 'goblin',
    name: 'Goblin',
    emoji: '👺',
    baseLevel: 2,
    baseHP: 45,
    baseAttack: 8,
    baseDefense: 4,
    baseSpeed: 6,
    expReward: 25,
    goldReward: 15,
    description: 'Goblin nhỏ nhưng nhanh.',
    isBoss: false
  },
  {
    id: 'skeleton',
    name: 'Bộ Xương',
    emoji: '💀',
    baseLevel: 3,
    baseHP: 60,
    baseAttack: 12,
    baseDefense: 6,
    baseSpeed: 5,
    expReward: 35,
    goldReward: 25,
    description: 'Xương sống tấn công người.',
    isBoss: false
  },
  {
    id: 'zombie',
    name: 'Zombie',
    emoji: '🧟',
    baseLevel: 4,
    baseHP: 80,
    baseAttack: 10,
    baseDefense: 3,
    baseSpeed: 3,
    expReward: 40,
    goldReward: 20,
    description: 'Thây ma slow nhưng dai.',
    isBoss: false
  },
  {
    id: 'spider',
    name: 'Nhện Độc',
    emoji: '🕷️',
    baseLevel: 5,
    baseHP: 55,
    baseAttack: 15,
    baseDefense: 5,
    baseSpeed: 12,
    expReward: 50,
    goldReward: 30,
    description: 'Nhện có nọc độc.',
    isBoss: false
  },
  {
    id: 'orc',
    name: 'Orc',
    emoji: '👹',
    baseLevel: 6,
    baseHP: 100,
    baseAttack: 18,
    baseDefense: 10,
    baseSpeed: 5,
    expReward: 65,
    goldReward: 40,
    description: 'Orc khỏe mạnh và hung dữ.',
    isBoss: false
  },
  {
    id: 'dark_mage',
    name: 'Pháp Sư Bóng Tối',
    emoji: '🧙',
    baseLevel: 8,
    baseHP: 70,
    baseAttack: 25,
    baseDefense: 8,
    baseSpeed: 10,
    expReward: 90,
    goldReward: 60,
    description: 'Pháp sư使用 dark magic.',
    isBoss: false
  },
  {
    id: 'minotaur',
    name: 'Minotaur',
    emoji: '🐂',
    baseLevel: 10,
    baseHP: 150,
    baseAttack: 30,
    baseDefense: 15,
    baseSpeed: 8,
    expReward: 120,
    goldReward: 80,
    description: 'Quái vật nửa người nửa bò.',
    isBoss: false
  },
  {
    id: 'boss_goblin_king',
    name: 'Vua Goblin',
    emoji: '👑',
    baseLevel: 5,
    baseHP: 150,
    baseAttack: 12,
    baseDefense: 8,
    baseSpeed: 7,
    expReward: 100,
    goldReward: 80,
    description: 'Boss đầu tiên - Vua của bọn Goblin.',
    isBoss: true
  },
  {
    id: 'boss_dragon',
    name: 'Rồng Lửa',
    emoji: '🐉',
    baseLevel: 15,
    baseHP: 400,
    baseAttack: 30,
    baseDefense: 18,
    baseSpeed: 12,
    expReward: 500,
    goldReward: 300,
    description: 'Boss cuối - Rồng lửa hùng mạnh.',
    isBoss: true
  },
  {
    id: 'boss_lich',
    name: 'Lich King',
    emoji: '☠️',
    baseLevel: 12,
    baseHP: 300,
    baseAttack: 25,
    baseDefense: 12,
    baseSpeed: 15,
    expReward: 350,
    goldReward: 200,
    description: 'Boss tầng 3 - Vua xác sống.',
    isBoss: true
  }
];

export function createMonster(template: MonsterTemplate, floorLevel: number): Monster {
  const scaling = 1 + (floorLevel - template.baseLevel) * 0.15;
  const level = Math.max(template.baseLevel, floorLevel);
  
  return {
    id: template.id,
    name: template.name,
    emoji: template.emoji,
    level: level,
    hp: Math.floor(template.baseHP * scaling),
    maxHP: Math.floor(template.baseHP * scaling),
    attack: Math.floor(template.baseAttack * scaling),
    defense: Math.floor(template.baseDefense * scaling),
    speed: template.baseSpeed + Math.floor(floorLevel / 5),
    expReward: Math.floor(template.expReward * scaling),
    goldReward: Math.floor(template.goldReward * scaling),
    description: template.description,
    isBoss: template.isBoss
  };
}

export function getMonstersForFloor(floor: number): MonsterTemplate[] {
  if (floor % 5 === 0 && floor >= 5) {
    const bossIndex = Math.min(Math.floor(floor / 5) - 1, 2);
    return [MONSTER_TEMPLATES.filter(m => m.isBoss)[bossIndex]];
  }
  
  return MONSTER_TEMPLATES.filter(m => !m.isBoss && m.baseLevel <= floor + 2);
}

export function getRandomMonster(floor: number): Monster {
  const available = getMonstersForFloor(floor);
  const template = available[Math.floor(Math.random() * available.length)];
  return createMonster(template, floor);
}
