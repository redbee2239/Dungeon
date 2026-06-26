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
  summon_wolf: { name: 'Sói', emoji: '🐺', baseHP: 50, baseAttack: 14, baseDefense: 3, baseSpeed: 7 },
  summon_bear: { name: 'Gấu', emoji: '🐻', baseHP: 94, baseAttack: 20, baseDefense: 7, baseSpeed: 3 },
  summon_phoenix: { name: 'Phượng Hoàng', emoji: '🔥', baseHP: 76, baseAttack: 29, baseDefense: 5, baseSpeed: 10 },
  summon_dragon: { name: 'Rồng', emoji: '🐉', baseHP: 126, baseAttack: 41, baseDefense: 10, baseSpeed: 8 },
  summon_army: { name: 'Quân Đoàn', emoji: '⚔️', baseHP: 189, baseAttack: 60, baseDefense: 14, baseSpeed: 7 }
};

export function createSummon(skillId: string, playerLevel: number, summonBoost: number = 0): Summon | null {
  const data = SUMMON_DATA[skillId];
  if (!data) return null;
  
  const scaling = 1 + (playerLevel - 1) * 0.08;
  const boost = 1 + summonBoost / 100;
  
  return {
    name: data.name,
    emoji: data.emoji,
    hp: Math.floor(data.baseHP * scaling * boost),
    maxHP: Math.floor(data.baseHP * scaling * boost),
    attack: Math.floor(data.baseAttack * scaling * boost),
    defense: Math.floor(data.baseDefense * scaling * boost),
    speed: Math.floor(data.baseSpeed * boost)
  };
}
