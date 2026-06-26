import { PlayerStats } from './classes';
import { Monster } from './monsters';
import { Item, getRandomDrop } from './items';
import { Skill } from './skills';
import { Summon } from './summons';
import {
  ActiveEvents,
  hasEffect,
  getEffectStacks,
  getMonsterDamageMultiplier,
  getPlayerDamageMultiplier,
  getMonsterDefenseMultiplier,
  getPlayerSpeedMultiplier,
  getMonsterCritBonus,
  getHealAmount,
  getPoisonDamage,
  getLifestealAmount,
  tickEvents
} from './dungeonEvents';

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
  stunned: boolean;
  stunTurns: number;
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

export function isCritical(speed: number, bonus: number = 0): boolean {
  return Math.random() < (speed * 0.001 + bonus);
}

export function isDodged(attackerSpeed: number, defenderSpeed: number): boolean {
  const dodgeChance = Math.max(0, (defenderSpeed - attackerSpeed) * 0.003);
  return Math.random() < dodgeChance;
}

export function playerAttack(
  playerStats: PlayerStats,
  monster: Monster,
  skill?: Skill,
  events?: ActiveEvents
): { damage: number; message: string; isCrit: boolean } {
  const noDodge = events ? hasEffect(events, 'no_dodge') : false;
  if (!noDodge && isDodged(playerStats.speed, monster.speed)) {
    return { damage: 0, message: 'Bạn đã bị né!', isCrit: false };
  }

  let baseDamage = playerStats.attack;
  let multiplier = 1;
  
  if (skill) {
    multiplier = skill.damage;
  }

  multiplier *= getPlayerDamageMultiplier(events || { events: [] });

  const isCrit = isCritical(playerStats.speed);
  if (isCrit) multiplier *= 1.5;

  const defMult = getMonsterDefenseMultiplier(events || { events: [] });
  const damage = Math.floor(
    Math.max(1, baseDamage * multiplier - (monster.defense * defMult) / 2) * (0.8 + Math.random() * 0.4)
  );

  return { damage, message: '', isCrit };
}

export function summonAttack(
  summon: Summon,
  monster: Monster,
  events?: ActiveEvents
): { damage: number; message: string; isCrit: boolean } {
  if (isDodged(summon.speed, monster.speed)) {
    return { damage: 0, message: `${summon.name} đã bị né!`, isCrit: false };
  }

  const isCrit = isCritical(summon.speed);
  let baseDamage = Math.floor(summon.attack * 2.2);
  if (isCrit) baseDamage = Math.floor(baseDamage * 1.5);

  const defMult = getMonsterDefenseMultiplier(events || { events: [] });
  const damage = Math.floor(
    Math.max(1, baseDamage - (monster.defense * defMult) / 2) * (0.8 + Math.random() * 0.4)
  );

  return { damage, message: '', isCrit };
}

export function monsterAttack(
  monster: Monster,
  targetStats: { speed: number; defense: number },
  targetName: string,
  events?: ActiveEvents
): { damage: number; message: string; isCrit: boolean; lifesteal: number } {
  const eventsData = events || { events: [] };
  const noDodge = hasEffect(eventsData, 'no_dodge');
  if (!noDodge && isDodged(monster.speed, targetStats.speed)) {
    return { damage: 0, message: `${monster.name} đã bị né!`, isCrit: false, lifesteal: 0 };
  }

  const critBonus = getMonsterCritBonus(eventsData);
  const isCrit = isCritical(monster.speed, critBonus);
  let baseDamage = Math.floor(monster.attack * getMonsterDamageMultiplier(eventsData));
  if (isCrit) baseDamage = Math.floor(baseDamage * 1.5);

  const damage = Math.floor(
    Math.max(1, baseDamage - targetStats.defense / 2) * (0.8 + Math.random() * 0.4)
  );

  const lifesteal = hasEffect(eventsData, 'monster_lifesteal') ? getLifestealAmount(damage) : 0;

  return { damage, message: '', isCrit, lifesteal };
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
  mpMultiplier: number = 1,
  events?: ActiveEvents,
  stunTurns: number = 0
): CombatResult {
  const effectiveStats = bonusStats ? {
    ...playerStats,
    attack: playerStats.attack + bonusStats.attack,
    defense: playerStats.defense + bonusStats.defense,
    maxHP: playerStats.maxHP + bonusStats.hp,
    maxMP: playerStats.maxMP + bonusStats.mp,
    speed: Math.floor((playerStats.speed + bonusStats.speed) * getPlayerSpeedMultiplier(events || { events: [] }))
  } : {
    ...playerStats,
    speed: Math.floor(playerStats.speed * getPlayerSpeedMultiplier(events || { events: [] }))
  };
  
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
  let newStunTurns = stunTurns;
  let expGained = 0;
  let goldGained = 0;
  let itemDropped: Item | null = null;

  const eventsData = events || { events: [] };

  // Poison damage
  if (hasEffect(eventsData, 'poison')) {
    const poisonDmg = getPoisonDamage(playerStats.maxHP);
    playerStats.hp = Math.max(1, playerStats.hp - poisonDmg);
    message += `☠️ Bạn mất **${poisonDmg}** HP do độc!\n`;
  }

  // Monster heal
  if (hasEffect(eventsData, 'monster_heal') && monster.hp > 0 && monster.hp < monster.maxHP) {
    const healAmt = getHealAmount(monster.maxHP);
    monster.hp = Math.min(monster.maxHP, monster.hp + healAmt);
    message += `💚 ${monster.name} hồi **${healAmt}** HP!\n`;
  }

  const playerFirst = effectiveStats.speed >= monster.speed;

  if (playerFirst) {
    // Player/Summon attacks first
    if (stunTurns > 0) {
      message += `💫 Bạn bị choáng, không thể tấn công! (${stunTurns} lượt còn lại)\n`;
      newStunTurns = stunTurns - 1;
    } else if (skill && summon && SUMMON_SKILLS.includes(skill.id)) {
      const sResult = summonAttack(summon, monster, eventsData);
      summonDamage = sResult.damage;
      summonDodged = sResult.damage === 0;

      if (summonDamage > 0) {
        monster.hp = Math.max(0, monster.hp - summonDamage);
        message += `${summon.emoji} ${summon.name} dùng ${skill.name} gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += `${summon.emoji} ${sResult.message}`;
      }
    } else if (skill) {
      const pResult = playerAttack(effectiveStats, monster, skill, eventsData);
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
      if (summon) {
        const sResult = summonAttack(summon, monster, eventsData);
        summonDamage = sResult.damage;
        summonDodged = sResult.damage === 0;

        if (summonDamage > 0) {
          monster.hp = Math.max(0, monster.hp - summonDamage);
          message += `${summon.emoji} ${summon.name} tấn công gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        } else {
          message += `${summon.emoji} ${sResult.message}`;
        }

        if (monster.hp > 0) {
          const pResult = playerAttack(effectiveStats, monster, undefined, eventsData);
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
        const pResult = playerAttack(effectiveStats, monster, undefined, eventsData);
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
        stunned: false, stunTurns: 0,
        expGained, goldGained, itemDropped, message
      };
    }

    // Monster attacks - prioritize summon
    if (summon && summon.hp > 0) {
      const mResult = monsterAttack(monster, { speed: summon.speed, defense: summon.defense }, summon.name, eventsData);
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      summonDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        summon.hp = Math.max(0, summon.hp - monsterDamage);
        message += `\n${monster.emoji} ${monster.name} tấn công ${summon.emoji} ${summon.name} gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        if (mResult.lifesteal > 0) {
          monster.hp = Math.min(monster.maxHP, monster.hp + mResult.lifesteal);
          message += ` (Hút **${mResult.lifesteal}** HP)`;
        }
        if (summon.hp <= 0) {
          summonDied = true;
          message += `\n${summon.emoji} **${summon.name}** đã bị tiêu diệt!`;
        }
      } else {
        message += `\n${mResult.message}`;
      }
    } else {
      const mResult = monsterAttack(monster, { speed: effectiveStats.speed, defense: effectiveStats.defense }, 'bạn', eventsData);
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      playerDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        playerStats.hp = Math.max(0, playerStats.hp - monsterDamage);
        message += `\n${monster.emoji} ${monster.name} tấn công gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        if (mResult.lifesteal > 0) {
          monster.hp = Math.min(monster.maxHP, monster.hp + mResult.lifesteal);
          message += ` (Hút **${mResult.lifesteal}** HP)`;
        }

        // Stun check
        if (hasEffect(eventsData, 'stun') && Math.random() < 0.3 * getEffectStacks(eventsData, 'stun')) {
          newStunTurns = 2;
          message += `\n💫 Bạn bị **CHOÁNG** 2 lượt!`;
        }
      } else {
        message += `\n${mResult.message}`;
      }
    }
  } else {
    // Monster attacks first
    if (summon && summon.hp > 0) {
      const mResult = monsterAttack(monster, { speed: summon.speed, defense: summon.defense }, summon.name, eventsData);
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      summonDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        summon.hp = Math.max(0, summon.hp - monsterDamage);
        message += `${monster.emoji} ${monster.name} tấn công ${summon.emoji} ${summon.name} gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        if (mResult.lifesteal > 0) {
          monster.hp = Math.min(monster.maxHP, monster.hp + mResult.lifesteal);
          message += ` (Hút **${mResult.lifesteal}** HP)`;
        }
        if (summon.hp <= 0) {
          summonDied = true;
          message += `\n${summon.emoji} **${summon.name}** đã bị tiêu diệt!`;
        }
      } else {
        message += mResult.message;
      }
    } else {
      const mResult = monsterAttack(monster, { speed: effectiveStats.speed, defense: effectiveStats.defense }, 'bạn', eventsData);
      monsterDamage = mResult.damage;
      monsterCrit = mResult.isCrit;
      playerDodged = mResult.damage === 0;

      if (monsterDamage > 0) {
        playerStats.hp = Math.max(0, playerStats.hp - monsterDamage);
        message += `${monster.emoji} ${monster.name} tấn công gây **${monsterDamage}** sát thương${monsterCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        if (mResult.lifesteal > 0) {
          monster.hp = Math.min(monster.maxHP, monster.hp + mResult.lifesteal);
          message += ` (Hút **${mResult.lifesteal}** HP)`;
        }

        // Stun check
        if (hasEffect(eventsData, 'stun') && Math.random() < 0.3 * getEffectStacks(eventsData, 'stun')) {
          newStunTurns = 2;
          message += `\n💫 Bạn bị **CHOÁNG** 2 lượt!`;
        }
      } else {
        message += `\n${mResult.message}`;
      }
    }

    if (playerStats.hp <= 0) {
      return {
        playerDamage: 0, monsterDamage, summonDamage: 0, playerCrit: false, monsterCrit,
        playerDodged, monsterDodged: false, summonDodged: false, monsterDied: false, playerDied: true, summonDied: false,
        stunned: false, stunTurns: 0,
        expGained: 0, goldGained: 0, itemDropped: null,
        message: message + `\n💀 Bạn đã bị ${monster.name} tiêu diệt!`
      };
    }

    // Player/Summon attacks
    if (stunTurns > 0) {
      message += `\n💫 Bạn bị choáng, không thể tấn công! (${stunTurns} lượt còn lại)`;
      newStunTurns = stunTurns - 1;
    } else if (skill && summon && SUMMON_SKILLS.includes(skill.id)) {
      const sResult = summonAttack(summon, monster, eventsData);
      summonDamage = sResult.damage;
      summonDodged = sResult.damage === 0;

      if (summonDamage > 0) {
        monster.hp = Math.max(0, monster.hp - summonDamage);
        message += `\n${summon.emoji} ${summon.name} dùng ${skill.name} gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
      } else {
        message += `\n${summon.emoji} ${sResult.message}`;
      }
    } else if (skill) {
      const pResult = playerAttack(effectiveStats, monster, skill, eventsData);
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
        const sResult = summonAttack(summon, monster, eventsData);
        summonDamage = sResult.damage;
        summonDodged = sResult.damage === 0;

        if (summonDamage > 0) {
          monster.hp = Math.max(0, monster.hp - summonDamage);
          message += `\n${summon.emoji} ${summon.name} tấn công gây **${summonDamage}** sát thương${sResult.isCrit ? ' (CHÍ MẠNG!)' : ''}!`;
        } else {
          message += `\n${summon.emoji} ${sResult.message}`;
        }

        if (monster.hp > 0) {
          const pResult = playerAttack(effectiveStats, monster, undefined, eventsData);
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
        const pResult = playerAttack(effectiveStats, monster, undefined, eventsData);
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

  // Tick events at end of round
  if (events) {
    tickEvents(events);
  }

  return {
    playerDamage, monsterDamage, summonDamage, playerCrit, monsterCrit,
    playerDodged, monsterDodged, summonDodged, monsterDied: monster.hp <= 0, playerDied: playerStats.hp <= 0, summonDied,
    stunned: newStunTurns > 0, stunTurns: newStunTurns,
    expGained, goldGained, itemDropped, message
  };
}

const SUMMON_SKILLS = ['summon_wolf', 'summon_bear', 'summon_phoenix', 'summon_dragon', 'summon_army'];
