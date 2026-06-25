export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'cleric';

export interface ClassStats {
  name: string;
  emoji: string;
  baseHP: number;
  baseMP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  description: string;
}

export const CLASS_DATA: Record<CharacterClass, ClassStats> = {
  warrior: {
    name: 'Chiến Binh',
    emoji: '⚔️',
    baseHP: 120,
    baseMP: 30,
    baseAttack: 15,
    baseDefense: 12,
    baseSpeed: 8,
    description: 'Sức mạnh và phòng thủ cao, phù hợp cho người mới.'
  },
  mage: {
    name: 'Pháp Sư',
    emoji: '🔮',
    baseHP: 70,
    baseMP: 100,
    baseAttack: 20,
    baseDefense: 5,
    baseSpeed: 10,
    description: 'Sức tấn công phép thuật cực mạnh, nhưng máu yếu.'
  },
  rogue: {
    name: 'Sát Thủ',
    emoji: '🗡️',
    baseHP: 85,
    baseMP: 50,
    baseAttack: 18,
    baseDefense: 7,
    baseSpeed: 15,
    description: 'Tốc độ nhanh, chí mạng cao, lẩn trốn giỏi.'
  },
  cleric: {
    name: 'Tu Sĩ',
    emoji: '✝️',
    baseHP: 90,
    baseMP: 80,
    baseAttack: 10,
    baseDefense: 10,
    baseSpeed: 9,
    description: 'Có khả năng hồi phục, hỗ trợ đồng đội.'
  }
};

export interface PlayerStats {
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHP: number;
  mp: number;
  maxMP: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
}

export function createBaseStats(characterClass: CharacterClass): PlayerStats {
  const cls = CLASS_DATA[characterClass];
  return {
    level: 1,
    exp: 0,
    expToNext: 100,
    hp: cls.baseHP,
    maxHP: cls.baseHP,
    mp: cls.baseMP,
    maxMP: cls.baseMP,
    attack: cls.baseAttack,
    defense: cls.baseDefense,
    speed: cls.baseSpeed,
    gold: 50
  };
}

export function getExpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function levelUp(stats: PlayerStats): PlayerStats {
  const newStats = { ...stats };
  newStats.level += 1;
  newStats.expToNext = getExpToNextLevel(newStats.level);
  
  newStats.maxHP += 10 + Math.floor(Math.random() * 5);
  newStats.maxMP += 5 + Math.floor(Math.random() * 3);
  newStats.attack += 2 + Math.floor(Math.random() * 2);
  newStats.defense += 1 + Math.floor(Math.random() * 2);
  newStats.speed += 1;
  
  newStats.hp = newStats.maxHP;
  newStats.mp = newStats.maxMP;
  
  return newStats;
}
