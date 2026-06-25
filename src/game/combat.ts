import { PlayerStats } from './classes';
import { Monster } from './monsters';
import { Item, getRandomDrop } from './items';
import { Skill } from './skills';

export interface CombatResult {
  playerDamage: number;
  monsterDamage: number;
  playerCrit: boolean;
  monsterCrit: boolean;
  playerDodged: boolean;
  monsterDodged: boolean;
  monsterDied: boolean;
  playerDied: boolean;
  expGained: number;
  goldGained: number;
  itemDropped: Item | null;
  message: string;
}

export function calculateDamage(attacker: number, defender: number): number {
  const baseDamage = Math.max(1, attacker - defender / 2);
  const variance = 0.8 + Math.random() * 0.4;
  return Math.floor(baseDamage * variance);
}

export function isCritical(speed: number): boolean {
  return Math.random() < speed * 0.008;
}

export function isDodged(attackerSpeed: number, defenderSpeed: number): boolean {
  const dodgeChance = Math.max(0, (defenderSpeed - attackerSpeed) * 0.02);
  return Math.random() < dodgeChance;
}

export function playerAttack(
  playerStats: PlayerStats,
  monster: Monster,
  skill?: Skill
): { damage: number; message: string; isCrit: boolean } {
  if (isDodged(playerStats.speed, monster.speed)) {
    return { damage: 0, message: 'Bạn đã bị né!', isCrit: false };
  }

  let baseDamage = playerStats.attack;
  let multiplier = 1;
  
  if (skill) {
    multiplier = skill.damage;
  }

  const isCrit = isCritical(playerStats.speed);
  if (isCrit) multiplier *= 1.5;

  const damage = Math.floor(
    Math.max(1, baseDamage * multiplier - monster.defense / 2) * (0.8 + Math.random() * 0.4)
  );

  return { damage, message: '', isCrit };
}

export function monsterAttack(
  monster: Monster,
  playerStats: PlayerStats
): { damage: number; message: string; isCrit: boolean } {
  if (isDodged(monster.speed, playerStats.speed)) {
    return { damage: 0, message: `${monster.name} đã bị né!`, isCrit: false };
  }

  const isCrit = isCritical(monster.speed);
  let baseDamage = monster.attack;
  if (isCrit) baseDamage = Math.floor(baseDamage * 1.5);

  const damage = Math.floor(
    Math.max(1, baseDamage - playerStats.defense / 2) * (0.8 + Math.random() * 0.4)
  );

  return { damage, message: '', isCrit };
}

export function useSkillMana(playerStats: PlayerStats, skill: Skill): boolean {
  return playerStats.mp >= skill.manaCost;
}

export function executeCombatRound(
  playerStats: PlayerStats,
  monster: Monster,
  skill?: Skill,
  bonusStats?: { attack: number; defense: number; hp: number; mp: number; speed: number }
): CombatResult {
  const effectiveStats = bonusStats ? {
    ...playerStats,
    attack: playerStats.attack + bonusStats.attack,
    defense: playerStats.defense + bonusStats.defense,
    maxHP: playerStats.maxHP + bonusStats.hp,
    maxMP: playerStats.maxMP + bonusStats.mp,
    speed: playerStats.speed + bonusStats.speed
  } : playerStats;
  let message = '';
  let playerDamage = 0;
  let monsterDamage = 0;
  let playerCrit = false;
  let monsterCrit = false;
  let playerDodged = false;
  let monsterDodged = false;
  let expGained = 0;
  let goldGained = 0;
  let itemDropped: Item | null = null;

  const playerFirst = effectiveStats.speed >= monster.speed;

  if (playerFirst) {
    const pResult = playerAttack(effectiveStats, monster, skill);
    playerDamage = pResult.damage;
    playerCrit = pResult.isCrit;
    monsterDodged = pResult.damage === 0;

    if (playerDamage > 0) {
      monster.hp = Math.max(0, monster.hp - playerDamage);
      message += `Bạn${skill ? ` dùng ${skill.name}` : ' tấn công'} gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
    } else {
      message += pResult.message;
    }

    if (monster.hp <= 0) {
      expGained = monster.expReward;
      goldGained = monster.goldReward;
      itemDropped = getRandomDrop(monster.level);
      message += `\n${monster.emoji} **${monster.name}** đã bị tiêu diệt!`;
      message += `\n+${expGained} EXP, +${goldGained} Gold`;
      if (itemDropped) {
        message += `\n${itemDropped.emoji} Nhận được: **${itemDropped.name}** (${itemDropped.rarity})`;
      }
      return {
        playerDamage, monsterDamage: 0, playerCrit, monsterCrit: false,
        playerDodged: false, monsterDodged, monsterDied: true, playerDied: false,
        expGained, goldGained, itemDropped, message
      };
    }

    const mResult = monsterAttack(monster, effectiveStats);
    monsterDamage = mResult.damage;
    monsterCrit = mResult.isCrit;
    playerDodged = mResult.damage === 0;

    if (monsterDamage > 0) {
      playerStats.hp = Math.max(0, playerStats.hp - monsterDamage);
      message += `\n${monster.emoji} ${monster.name} tấn công gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
    } else {
      message += `\n${mResult.message}`;
    }
  } else {
    const mResult = monsterAttack(monster, effectiveStats);
    monsterDamage = mResult.damage;
    monsterCrit = mResult.isCrit;
    playerDodged = mResult.damage === 0;

    if (monsterDamage > 0) {
      playerStats.hp = Math.max(0, playerStats.hp - monsterDamage);
      message += `${monster.emoji} ${monster.name} tấn công gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
    } else {
      message += mResult.message;
    }

    if (playerStats.hp <= 0) {
      return {
        playerDamage: 0, monsterDamage, playerCrit: false, monsterCrit,
        playerDodged, monsterDodged: false, monsterDied: false, playerDied: true,
        expGained: 0, goldGained: 0, itemDropped: null,
        message: message + `\n💀 Bạn đã bị ${monster.name} tiêu diệt!`
      };
    }

    const pResult = playerAttack(effectiveStats, monster, skill);
    playerDamage = pResult.damage;
    playerCrit = pResult.isCrit;
    monsterDodged = pResult.damage === 0;

    if (playerDamage > 0) {
      monster.hp = Math.max(0, monster.hp - playerDamage);
      message += `\nBạn${skill ? ` dùng ${skill.name}` : ' tấn công'} gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
    } else {
      message += `\n${pResult.message}`;
    }

    if (monster.hp <= 0) {
      expGained = monster.expReward;
      goldGained = monster.goldReward;
      itemDropped = getRandomDrop(monster.level);
      message += `\n${monster.emoji} **${monster.name}** đã bị tiêu diệt!`;
      message += `\n+${expGained} EXP, +${goldGained} Gold`;
      if (itemDropped) {
        message += `\n${itemDropped.emoji} Nhận được: **${itemDropped.name}** (${itemDropped.rarity})`;
      }
    }
  }

  return {
    playerDamage, monsterDamage, playerCrit, monsterCrit,
    playerDodged, monsterDodged, monsterDied: monster.hp <= 0, playerDied: playerStats.hp <= 0,
    expGained, goldGained, itemDropped, message
  };
}
