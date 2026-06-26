import { PlayerStats } from './classes';
import { Monster } from './monsters';
import { Item, getRandomDrop } from './items';
import { Skill } from './skills';
import { Summon } from './summons';

export interface CombatResult {
  playerDamage: number;
  monsterDamage: number;
  summonDamage: number;
  playerCrit: boolean;
  monsterCrit: boolean;
  playerDodged: boolean;
  monsterDodged: boolean;
  summonDodged: boolean;
  monsterDied: boolean;
  playerDied: boolean;
  summonDied: boolean;
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

export function summonAttack(
  summon: Summon,
  monster: Monster
): { damage: number; message: string; isCrit: boolean } {
  if (isDodged(summon.speed, monster.speed)) {
    return { damage: 0, message: `${summon.name} đã bị né!`, isCrit: false };
  }

  const isCrit = isCritical(summon.speed);
  let baseDamage = summon.attack;
  if (isCrit) baseDamage = Math.floor(baseDamage * 1.5);

  const damage = Math.floor(
    Math.max(1, baseDamage - monster.defense / 2) * (0.8 + Math.random() * 0.4)
  );

  return { damage, message: '', isCrit };
}

export function monsterAttack(
  monster: Monster,
  targetStats: { speed: number; defense: number },
  targetName: string
): { damage: number; message: string; isCrit: boolean } {
  if (isDodged(monster.speed, targetStats.speed)) {
    return { damage: 0, message: `${monster.name} đã bị né!`, isCrit: false };
  }

  const isCrit = isCritical(monster.speed);
  let baseDamage = monster.attack;
  if (isCrit) baseDamage = Math.floor(baseDamage * 1.5);

  const damage = Math.floor(
    Math.max(1, baseDamage - targetStats.defense / 2) * (0.8 + Math.random() * 0.4)
  );

  return { damage, message: '', isCrit };
}

export function useSkillMana(playerStats: PlayerStats, skill: Skill, mpMultiplier: number = 1): boolean {
  return playerStats.mp >= skill.manaCost * mpMultiplier;
}

export function executeCombatRound(
  playerStats: PlayerStats,
  monster: Monster,
  skill?: Skill,
  bonusStats?: { attack: number; defense: number; hp: number; mp: number; speed: number },
  summon?: Summon | null,
  mpMultiplier: number = 1
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
  let summonDamage = 0;
  let playerCrit = false;
  let monsterCrit = false;
  let playerDodged = false;
  let monsterDodged = false;
  let summonDodged = false;
  let summonDied = false;
  let expGained = 0;
  let goldGained = 0;
  let itemDropped: Item | null = null;

  const playerFirst = effectiveStats.speed >= monster.speed;

  if (playerFirst) {
    // Player/Summon attacks first
    if (skill && summon && SUMMON_SKILLS.includes(skill.id)) {
      // Summon attacks with skill
      const sResult = summonAttack(summon, monster);
      summonDamage = sResult.damage;
      summonDodged = sResult.damage === 0;

      if (summonDamage > 0) {
        monster.hp = Math.max(0, monster.hp - summonDamage);
        message += `${summon.emoji} ${summon.name} dùng ${skill.name} gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += `${summon.emoji} ${sResult.message}`;
      }
    } else if (skill) {
      // Player uses skill
      const pResult = playerAttack(effectiveStats, monster, skill);
      playerDamage = pResult.damage;
      playerCrit = pResult.isCrit;
      monsterDodged = pResult.damage === 0;

      if (playerDamage > 0) {
        monster.hp = Math.max(0, monster.hp - playerDamage);
        message += `Bạn dùng ${skill.name} gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += pResult.message;
      }
    } else {
      // Normal attack - both summon and player attack if summon exists
      if (summon) {
        const sResult = summonAttack(summon, monster);
        summonDamage = sResult.damage;
        summonDodged = sResult.damage === 0;

        if (summonDamage > 0) {
          monster.hp = Math.max(0, monster.hp - summonDamage);
          message += `${summon.emoji} ${summon.name} tấn công gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        } else {
          message += `${summon.emoji} ${sResult.message}`;
        }

        if (monster.hp > 0) {
          const pResult = playerAttack(effectiveStats, monster);
          playerDamage = pResult.damage;
          playerCrit = pResult.isCrit;
          monsterDodged = pResult.damage === 0;

          if (playerDamage > 0) {
            monster.hp = Math.max(0, monster.hp - playerDamage);
            message += `\nBạn tấn công gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
          } else {
            message += `\n${pResult.message}`;
          }
        }
      } else {
        const pResult = playerAttack(effectiveStats, monster);
        playerDamage = pResult.damage;
        playerCrit = pResult.isCrit;
        monsterDodged = pResult.damage === 0;

        if (playerDamage > 0) {
          monster.hp = Math.max(0, monster.hp - playerDamage);
          message += `Bạn tấn công gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        } else {
          message += pResult.message;
        }
      }
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
        playerDamage, monsterDamage: 0, summonDamage: 0, playerCrit, monsterCrit: false,
        playerDodged: false, monsterDodged, summonDodged: false, monsterDied: true, playerDied: false, summonDied: false,
        expGained, goldGained, itemDropped, message
      };
    }

    // Monster attacks - prioritize summon
    if (summon && summon.hp > 0) {
      const mResult = monsterAttack(monster, { speed: summon.speed, defense: summon.defense }, summon.name);
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      summonDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        summon.hp = Math.max(0, summon.hp - monsterDamage);
        message += `\n${monster.emoji} ${monster.name} tấn công ${summon.emoji} ${summon.name} gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        if (summon.hp <= 0) {
          summonDied = true;
          message += `\n${summon.emoji} **${summon.name}** đã bị tiêu diệt!`;
        }
      } else {
        message += `\n${mResult.message}`;
      }
    } else {
      const mResult = monsterAttack(monster, { speed: effectiveStats.speed, defense: effectiveStats.defense }, 'bạn');
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      playerDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        playerStats.hp = Math.max(0, playerStats.hp - monsterDamage);
        message += `\n${monster.emoji} ${monster.name} tấn công gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += `\n${mResult.message}`;
      }
    }
  } else {
    // Monster attacks first
    if (summon && summon.hp > 0) {
      const mResult = monsterAttack(monster, { speed: summon.speed, defense: summon.defense }, summon.name);
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      summonDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        summon.hp = Math.max(0, summon.hp - monsterDamage);
        message += `${monster.emoji} ${monster.name} tấn công ${summon.emoji} ${summon.name} gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        if (summon.hp <= 0) {
          summonDied = true;
          message += `\n${summon.emoji} **${summon.name}** đã bị tiêu diệt!`;
        }
      } else {
        message += mResult.message;
      }
    } else {
      const mResult = monsterAttack(monster, { speed: effectiveStats.speed, defense: effectiveStats.defense }, 'bạn');
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      playerDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        playerStats.hp = Math.max(0, playerStats.hp - monsterDamage);
        message += `${monster.emoji} ${monster.name} tấn công gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += mResult.message;
      }
    }

    if (playerStats.hp <= 0) {
      return {
        playerDamage: 0, monsterDamage, summonDamage: 0, playerCrit: false, monsterCrit,
        playerDodged, monsterDodged: false, summonDodged: false, monsterDied: false, playerDied: true, summonDied: false,
        expGained: 0, goldGained: 0, itemDropped: null,
        message: message + `\n💀 Bạn đã bị ${monster.name} tiêu diệt!`
      };
    }

    // Player/Summon attacks
    if (skill && summon && SUMMON_SKILLS.includes(skill.id)) {
      const sResult = summonAttack(summon, monster);
      summonDamage = sResult.damage;
      summonDodged = sResult.damage === 0;

      if (summonDamage > 0) {
        monster.hp = Math.max(0, monster.hp - summonDamage);
        message += `\n${summon.emoji} ${summon.name} dùng ${skill.name} gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += `\n${summon.emoji} ${sResult.message}`;
      }
    } else if (skill) {
      const pResult = playerAttack(effectiveStats, monster, skill);
      playerDamage = pResult.damage;
      playerCrit = pResult.isCrit;
      monsterDodged = pResult.damage === 0;

      if (playerDamage > 0) {
        monster.hp = Math.max(0, monster.hp - playerDamage);
        message += `\nBạn dùng ${skill.name} gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += `\n${pResult.message}`;
      }
    } else {
      if (summon) {
        const sResult = summonAttack(summon, monster);
        summonDamage = sResult.damage;
        summonDodged = sResult.damage === 0;

        if (summonDamage > 0) {
          monster.hp = Math.max(0, monster.hp - summonDamage);
          message += `\n${summon.emoji} ${summon.name} tấn công gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        } else {
          message += `\n${summon.emoji} ${sResult.message}`;
        }

        if (monster.hp > 0) {
          const pResult = playerAttack(effectiveStats, monster);
          playerDamage = pResult.damage;
          playerCrit = pResult.isCrit;
          monsterDodged = pResult.damage === 0;

          if (playerDamage > 0) {
            monster.hp = Math.max(0, monster.hp - playerDamage);
            message += `\nBạn tấn công gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
          } else {
            message += `\n${pResult.message}`;
          }
        }
      } else {
        const pResult = playerAttack(effectiveStats, monster);
        playerDamage = pResult.damage;
        playerCrit = pResult.isCrit;
        monsterDodged = pResult.damage === 0;

        if (playerDamage > 0) {
          monster.hp = Math.max(0, monster.hp - playerDamage);
          message += `\nBạn tấn công gây **${playerDamage}** sát thương${playerCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        } else {
          message += `\n${pResult.message}`;
        }
      }
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
    playerDamage, monsterDamage, summonDamage, playerCrit, monsterCrit,
    playerDodged, monsterDodged, summonDodged, monsterDied: monster.hp <= 0, playerDied: playerStats.hp <= 0, summonDied,
    expGained, goldGained, itemDropped, message
  };
}

const SUMMON_SKILLS = ['summon_wolf', 'summon_bear', 'summon_phoenix', 'summon_dragon', 'summon_army'];
