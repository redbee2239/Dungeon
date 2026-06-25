export interface Summon {
  name: string;
  emoji: string;
  hp: number;
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
}

export const SUMMON_DATA: Record<string, { name: string; emoji: string; baseHP: number; baseAttack: number; baseDefense: number; baseSpeed: number }> = {
  summon_wolf: { name: 'Sói', emoji: '🐺', baseHP: 80, baseAttack: 12, baseDefense: 5, baseSpeed: 10 },
  summon_bear: { name: 'Gấu', emoji: '🐻', baseHP: 150, baseAttack: 18, baseDefense: 10, baseSpeed: 5 },
  summon_phoenix: { name: 'Phượng Hoàng', emoji: '🔥', baseHP: 120, baseAttack: 25, baseDefense: 8, baseSpeed: 15 },
  summon_dragon: { name: 'Rồng', emoji: '🐉', baseHP: 200, baseAttack: 35, baseDefense: 15, baseSpeed: 12 },
  summon_army: { name: 'Quân Đoàn', emoji: '⚔️', baseHP: 300, baseAttack: 50, baseDefense: 20, baseSpeed: 10 }
};

export function createSummon(skillId: string, playerLevel: number): Summon | null {
  const data = SUMMON_DATA[skillId];
  if (!data) return null;
  
  const scaling = 1 + (playerLevel - 1) * 0.1;
  
  return {
    name: data.name,
    emoji: data.emoji,
    hp: Math.floor(data.baseHP * scaling),
    maxHP: Math.floor(data.baseHP * scaling),
    attack: Math.floor(data.baseAttack * scaling),
    defense: Math.floor(data.baseDefense * scaling),
    speed: data.baseSpeed
  };
}
