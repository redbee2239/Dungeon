export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'cleric' | 'gladiator' | 'summoner' | 'archer';

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
    baseHP: 200,
    baseMP: 50,
    baseAttack: 25,
    baseDefense: 18,
    baseSpeed: 10,
    description: 'Sức mạnh và phòng thủ cao, phù hợp cho người mới.'
  },
  mage: {
    name: 'Pháp Sư',
    emoji: '🔮',
    baseHP: 120,
    baseMP: 150,
    baseAttack: 35,
    baseDefense: 8,
    baseSpeed: 12,
    description: 'Sức tấn công phép thuật cực mạnh, nhưng máu yếu.'
  },
  rogue: {
    name: 'Sát Thủ',
    emoji: '🗡️',
    baseHP: 150,
    baseMP: 80,
    baseAttack: 30,
    baseDefense: 10,
    baseSpeed: 22,
    description: 'Tốc độ nhanh, chí mạng cao, lẩn trốn giỏi.'
  },
  cleric: {
    name: 'Tu Sĩ',
    emoji: '✝️',
    baseHP: 160,
    baseMP: 120,
    baseAttack: 18,
    baseDefense: 15,
    baseSpeed: 11,
    description: 'Có khả năng hồi phục, hỗ trợ đồng đội.'
  },
  gladiator: {
    name: 'Đấu Sĩ',
    emoji: '🏟️',
    baseHP: 220,
    baseMP: 40,
    baseAttack: 32,
    baseDefense: 14,
    baseSpeed: 9,
    description: 'Sức mạnh tấn công cực cao, chuyên dùng vũ khí sát thương.'
  },
  summoner: {
    name: 'Triệu Hồi Sư',
    emoji: 'Summon',
    baseHP: 130,
    baseMP: 160,
    baseAttack: 28,
    baseDefense: 10,
    baseSpeed: 11,
    description: 'Triệu hồi quái vật hỗ trợ chiến đấu.'
  },
  archer: {
    name: 'Cung Thủ',
    emoji: '🏹',
    baseHP: 160,
    baseMP: 60,
    baseAttack: 32,
    baseDefense: 12,
    baseSpeed: 20,
    description: 'Tấn công từ xa, chí mạng cao.'
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
    expToNext: 80,
    hp: cls.baseHP,
    maxHP: cls.baseHP,
    mp: cls.baseMP,
    maxMP: cls.baseMP,
    attack: cls.baseAttack,
    defense: cls.baseDefense,
    speed: cls.baseSpeed,
    gold: 100
  };
}

export function getExpToNextLevel(level: number): number {
  return Math.floor(50 + level * 30);
}

export function levelUp(stats: PlayerStats): PlayerStats {
  const newStats = { ...stats };
  newStats.level += 1;
  newStats.expToNext = getExpToNextLevel(newStats.level);
  
  newStats.maxHP += 15 + Math.floor(Math.random() * 10);
  newStats.maxMP += 8 + Math.floor(Math.random() * 5);
  newStats.attack += 3 + Math.floor(Math.random() * 3);
  newStats.defense += 2 + Math.floor(Math.random() * 2);
  newStats.speed += 1 + Math.floor(Math.random() * 2);
  
  newStats.hp = newStats.maxHP;
  newStats.mp = newStats.maxMP;
  
  return newStats;
}
