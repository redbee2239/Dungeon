import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } from 'discord.js';
import { Database } from '../game/database';
import { getRandomMonster, Monster, BOSS_FLOORS } from '../game/monsters';
import { executeCombatRound, useSkillMana } from '../game/combat';
import { FLOOR_NAMES, FLOOR_DESCRIPTIONS } from '../game/dungeon';
import { getSkillsForClass, Skill } from '../game/skills';
import { addItem, calculateBonusStats } from '../game/inventory';
import { rollChest, CHEST_RARITY_NAMES, CHEST_RARITY_COLORS } from '../game/chests';

interface CombatData {
  monster: Monster;
  floor: number;
  active: boolean;
  skillUsage: Record<string, number>;
}

const SKILL_LIMIT = 3;
const activeCombats = new Map<string, CombatData>();

function generateProgressBar(current: number, max: number, length: number): string {
  const filled = Math.floor((current / max) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getAvailableSkills(player: any): Skill[] {
  let unlocked = player.unlockedSkills || [];
  const starterSkill = getStarterSkill(player.characterClass);
  if (starterSkill && !unlocked.includes(starterSkill)) {
    unlocked = [starterSkill, ...unlocked];
  }
  const skills = getSkillsForClass(player.characterClass, player.stats.level);
  return skills.filter(s => unlocked.includes(s.id) && player.stats.mp >= s.manaCost);
}

function getStarterSkill(characterClass: string): string | null {
  const starters: Record<string, string> = {
    warrior: 'basic_slash',
    mage: 'spark',
    rogue: 'quick_strike',
    cleric: 'holy_smite',
    gladiator: 'battle_cry',
    summoner: 'summon_wolf',
    archer: 'quick_shot'
  };
  return starters[characterClass] || null;
}

export const prefixCommand = {
  name: 'dungeon',
  description: 'Khám phá hầm ngục',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    if (player.stats.hp <= 0) {
      return message.reply('❌ Bạn đã chết! Dùng `,heal` để hồi phục.');
    }

    if (activeCombats.has(userId)) {
      return message.reply('❌ Bạn đang có battle chưa xong! Đợi hết hoặc bỏ chạy.');
    }

    let floor = player.dungeon.currentFloor;
    const floorArg = args[0];

    if (floorArg) {
      const requestedFloor = parseInt(floorArg);
      if (isNaN(requestedFloor) || requestedFloor < 1) {
        return message.reply('❌ Số tầng không hợp lệ!');
      }
      if (requestedFloor > player.highestFloor + 1) {
        return message.reply(`❌ Bạn chỉ có thể lên đến tầng **${player.highestFloor + 1}**!\nHãy chinh phục tầng trước đó trước.`);
      }

      const prevBossFloor = BOSS_FLOORS.filter(bf => bf < requestedFloor).pop();
      if (prevBossFloor && player.highestFloor <= prevBossFloor) {
        return message.reply(`❌ Bạn phải đánh bại Boss tầng **${prevBossFloor}** trước khi lên tầng ${requestedFloor}!`);
      }

      floor = requestedFloor;
    }

    const monster = getRandomMonster(floor);

    activeCombats.set(userId, { monster, floor, active: true, skillUsage: {} });

    const bonus = calculateBonusStats(player.inventory);
    const totalHP = player.stats.maxHP + bonus.hp;
    const totalMP = player.stats.maxMP + bonus.mp;

    const floorName = FLOOR_NAMES[floor] || `Tầng ${floor}`;
    const floorDesc = FLOOR_DESCRIPTIONS[floor] || 'Hầm ngục bí ẩn.';

    const embed = new EmbedBuilder()
      .setTitle(`🏰 Dungeon - Tầng ${floor}: ${floorName}`)
      .setDescription(floorDesc)
      .addFields(
        {
          name: `${monster.emoji} ${monster.name}${monster.isBoss ? ' (BOSS!)' : ''}`,
          value: [
            `❤️ HP: ${monster.hp}/${monster.maxHP}`,
            `⚔️ ATK: ${monster.attack} | 🛡️ DEF: ${monster.defense}`,
            `💨 SPD: ${monster.speed} | 📊 Lv.${monster.level}`,
            `💰 ${monster.expReward} EXP, ${monster.goldReward} Gold`
          ].join('\n'),
          inline: true
        },
        {
          name: '👤 Bạn',
          value: [
            `❤️ HP: ${player.stats.hp}/${totalHP}`,
            `💧 MP: ${player.stats.mp}/${totalMP}`,
            `⚔️ ATK: ${player.stats.attack + bonus.attack}`
          ].join('\n'),
          inline: true
        }
      )
      .setColor(monster.isBoss ? 0xFF0000 : 0xFF6600);

    const row = new ActionRowBuilder<ButtonBuilder>();
    row.addComponents(
      new ButtonBuilder().setCustomId('attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('flee').setLabel('🏃 Chạy Trốn').setStyle(ButtonStyle.Secondary)
    );

    const starterSkill = getStarterSkill(player.characterClass);
    const hasAnySkills = getSkillsForClass(player.characterClass, player.stats.level)
      .some(s => (player.unlockedSkills.includes(s.id) || s.id === starterSkill));
    
    if (hasAnySkills) {
      row.addComponents(
        new ButtonBuilder().setCustomId('skill').setLabel('✨ Kỹ Năng').setStyle(ButtonStyle.Primary)
      );
    }

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 90000
    });

    collector.on('collect', async (i: any) => {
      if (i.user.id !== userId) {
        return i.reply({ content: 'Đây không phải battle của bạn!', ephemeral: true });
      }

      const combatData = activeCombats.get(userId);
      if (!combatData || !combatData.active) return;

      await i.deferUpdate();

      if (i.customId === 'flee') {
        const fleeChance = player.stats.speed / (player.stats.speed + combatData.monster.speed);
        if (Math.random() < fleeChance) {
          combatData.active = false;
          activeCombats.delete(userId);
          collector.stop();
          await i.editReply({ content: '🏃 Chạy trốn thành công!', embeds: [], components: [] });
        } else {
          const result = executeCombatRound(player.stats, combatData.monster, undefined, bonus);
          if (result.playerDied) {
            combatData.active = false;
            activeCombats.delete(userId);
            collector.stop();
            await db.updatePlayer(player);
            await i.editReply({ content: `💀 Bị tiêu diệt!\n${result.message}`, embeds: [], components: [] });
          } else if (result.monsterDied) {
            combatData.active = false;
            collector.stop();
            await handleVictory(i, player, combatData, db, result);
          } else {
            await showCombatStatus(i, player, combatData.monster, `🏃 Không chạy được!\n${result.message}`, combatData.skillUsage);
          }
        }
        return;
      }

      if (i.customId === 'skill') {
        const availableSkills = getAvailableSkills(player);
        
        if (availableSkills.length === 0) {
          await showCombatStatus(i, player, combatData.monster, '❌ Không có kỹ năng nào khả dụng (hết MP hoặc chưa học)!', combatData.skillUsage);
          return;
        }

        const usableSkills = availableSkills.filter(s => {
          const used = combatData.skillUsage[s.id] || 0;
          return used < SKILL_LIMIT;
        });

        if (usableSkills.length === 0) {
          await showCombatStatus(i, player, combatData.monster, '❌ Hết lượt sử dụng kỹ năng trong lượt này!', combatData.skillUsage);
          return;
        }

        const limitedSkills = usableSkills.slice(0, 25);
        const skillRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        skillRow.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('skill_select')
            .setPlaceholder('Chọn kỹ năng...')
            .addOptions(
              limitedSkills.map(s => {
                const used = combatData.skillUsage[s.id] || 0;
                return {
                  label: `${s.name} (${s.manaCost} MP) [${SKILL_LIMIT - used}]`.substring(0, 100),
                  value: s.id,
                  description: s.description.substring(0, 100)
                };
              })
            )
        );

        await i.editReply({
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setCustomId('attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
              new ButtonBuilder().setCustomId('flee').setLabel('🏃 Chạy Trốn').setStyle(ButtonStyle.Secondary)
            ),
            skillRow
          ]
        });

        const skillCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 30000
        });

        skillCollector.on('collect', async (si: any) => {
          if (si.user.id !== userId) return;
          await si.deferUpdate();

          const skillId = si.values[0];
          const skill = availableSkills.find(s => s.id === skillId);

          if (skill && player.stats.mp >= skill.manaCost) {
            player.stats.mp -= skill.manaCost;
            combatData.skillUsage[skillId] = (combatData.skillUsage[skillId] || 0) + 1;
          }

          const result = executeCombatRound(player.stats, combatData.monster, skill, bonus);

          if (result.monsterDied || result.playerDied) {
            combatData.active = false;
            collector.stop();
          }

          await processResult(si, player, combatData, db, result);
          skillCollector.stop();
        });

        return;
      }

      const result = executeCombatRound(player.stats, combatData.monster, undefined, bonus);

      if (result.monsterDied || result.playerDied) {
        combatData.active = false;
        collector.stop();
      }

      await processResult(i, player, combatData, db, result);
    });

    collector.on('end', async (_collected: any, reason: string) => {
      const combatData = activeCombats.get(userId);
      if (combatData && combatData.active && reason === 'time') {
        combatData.active = false;
        activeCombats.delete(userId);
        await message.reply('⏰ Hết thời gian! Battle kết thúc.');
      } else {
        activeCombats.delete(userId);
      }
    });
  }
};

async function processResult(i: any, player: any, combatData: CombatData, db: Database, result: any) {
  if (result.monsterDied) {
    await handleVictory(i, player, combatData, db, result);
  } else if (result.playerDied) {
    await db.updatePlayer(player);
    await i.editReply({ content: `💀 **GAME OVER**\n${result.message}`, embeds: [], components: [] });
  } else {
    await showCombatStatus(i, player, combatData.monster, result.message, combatData.skillUsage);
  }
}

async function handleVictory(i: any, player: any, combatData: any, db: Database, result: any) {
  const expResult = await db.addExp(player, result.expGained);
  await db.addGold(player, result.goldGained);

  let gemsEarned = 0;
  if (combatData.monster.isBoss) {
    gemsEarned = 10 + Math.floor(Math.random() * 40);
  } else if (combatData.monster.level >= 10) {
    gemsEarned = 5 + Math.floor(Math.random() * 10);
  } else {
    gemsEarned = Math.floor(Math.random() * 3);
  }

  if (gemsEarned > 0) {
    await db.addGems(player, gemsEarned);
  }

  if (result.itemDropped) {
    addItem(player.inventory, result.itemDropped);
    const gemBonus = Math.floor(Math.random() * 10) + 5;
    await db.addGems(player, gemBonus);
    gemsEarned += gemBonus;
  }

  let chestMsg = '';
  if (combatData.monster.isBoss) {
    const chest = rollChest(combatData.floor);
    if (chest) {
      await db.addChest(player, chest.id);
      chestMsg = `\n${chest.emoji} Nhận được: **${chest.name}** (${CHEST_RARITY_NAMES[chest.rarity]})`;
    }
  }

  if (combatData.floor >= player.highestFloor) {
    player.highestFloor = combatData.floor + 1;
    player.dungeon.currentFloor = combatData.floor + 1;
  }

  player.totalMonstersKilled += 1;
  await db.updatePlayer(player);

  let msg = `⚔️ **CHIẾN THẮNG!**\n${result.message}`;
  msg += `\n💎 +${gemsEarned} Gem`;
  msg += chestMsg;
  if (expResult.leveled) {
    const levelGems = expResult.levelsGained * 5;
    await db.addGems(player, levelGems);
    msg += `\n\n🎉 **LEVEL UP!** Level ${player.stats.level} (+${expResult.levelsGained})`;
    msg += `\n⭐ +${expResult.levelsGained} Skill Points`;
    msg += `\n💎 +${levelGems} Gem (Level Bonus)`;
  }

  const embed = new EmbedBuilder()
    .setTitle('🏆 Chiến Thắng!')
    .setDescription(msg)
    .setColor(0x00FF00);

  await i.editReply({ embeds: [embed], components: [] });
}

async function showCombatStatus(i: any, player: any, monster: Monster, extraMessage?: string, skillUsage?: Record<string, number>) {
  const bonus = calculateBonusStats(player.inventory);
  const totalHP = player.stats.maxHP + bonus.hp;
  const totalMP = player.stats.maxMP + bonus.mp;

  const monsterBar = generateProgressBar(monster.hp, monster.maxHP, 15);
  const playerBar = generateProgressBar(player.stats.hp, totalHP, 15);

  const embed = new EmbedBuilder()
    .setTitle('⚔️ Combat')
    .setDescription(extraMessage || '')
    .addFields(
      { name: `${monster.emoji} ${monster.name}`, value: `❤️ ${monster.hp}/${monster.maxHP}\n${monsterBar}`, inline: true },
      { name: '👤 Bạn', value: `❤️ ${player.stats.hp}/${totalHP} | 💧 ${player.stats.mp}/${totalMP}\n${playerBar}`, inline: true }
    )
    .setColor(0xFF6600);

  const starterSkill = getStarterSkill(player.characterClass);
  const allSkills = getSkillsForClass(player.characterClass, player.stats.level);
  const hasAnySkills = allSkills.some(s => {
    const unlocked = player.unlockedSkills.includes(s.id) || s.id === starterSkill;
    const hasMP = player.stats.mp >= s.manaCost;
    const hasUses = !skillUsage || (skillUsage[s.id] || 0) < SKILL_LIMIT;
    return unlocked && hasMP && hasUses;
  });

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder().setCustomId('attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger)
  );

  if (hasAnySkills) {
    row.addComponents(
      new ButtonBuilder().setCustomId('skill').setLabel('✨ Kỹ Năng').setStyle(ButtonStyle.Primary)
    );
  }

  row.addComponents(
    new ButtonBuilder().setCustomId('flee').setLabel('🏃 Chạy Trốn').setStyle(ButtonStyle.Secondary)
  );

  await i.editReply({ embeds: [embed], components: [row] });
}
