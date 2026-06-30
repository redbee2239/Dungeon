import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } from 'discord.js';
import { Database } from '../game/database';
import { getRandomMonster, getMultipleRandomMonsters, Monster, BOSS_FLOORS } from '../game/monsters';
import { executeCombatRound, useSkillMana } from '../game/combat';
import { FLOOR_NAMES, FLOOR_DESCRIPTIONS } from '../game/dungeon';
import { getSkillsForClass, Skill } from '../game/skills';
import { addItem, calculateBonusStats, removeItem } from '../game/inventory';
import { rollChest, CHEST_RARITY_NAMES, CHEST_RARITY_COLORS } from '../game/chests';
import { Summon, createSummon, SUMMON_DATA } from '../game/summons';
import { ActiveEvents, createActiveEvents, rollForEvent, getEventMessages } from '../game/dungeonEvents';
import { ITEMS } from '../game/items';

const SUMMON_SKILL_IDS = ['summon_wolf', 'summon_bear', 'summon_phoenix', 'summon_dragon', 'summon_army'];

interface CombatBuff {
  stat: string;
  amount: number;
}

interface CombatData {
  monster: Monster;
  monsterQueue: Monster[];
  floor: number;
  active: boolean;
  skillUsage: Record<string, number>;
  summon: Summon | null;
  events: ActiveEvents;
  stunTurns: number;
  buffs: CombatBuff[];
  debuffs: CombatBuff[];
  potionUsed: number;
}

const SKILL_LIMIT = 3;
const SUMMONER_SKILL_LIMIT = 1;
const POTION_LIMIT = 2;
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

    if (player.afk?.isAfk) {
      return message.reply('❌ Bạn đang AFK! Dùng `,afk` để tắt AFK trước khi đánh dungeon.');
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

    const monsters = getMultipleRandomMonsters(floor);
    const monster = monsters[0];
    const monsterQueue = monsters.slice(1);

    activeCombats.set(userId, { monster, monsterQueue, floor, active: true, skillUsage: {}, summon: null, events: createActiveEvents(), stunTurns: 0, buffs: [], debuffs: [], potionUsed: 0 });

    const bonus = calculateBonusStats(player.inventory, player.equippedPet);
    const totalHP = player.stats.maxHP + bonus.hp;
    const totalMP = player.stats.maxMP + bonus.mp;

    function getBuffBonus(): { attack: number; defense: number; hp: number; mp: number; speed: number } {
      const combatData = activeCombats.get(userId);
      if (!combatData) return { attack: 0, defense: 0, hp: 0, mp: 0, speed: 0 };
      let atkBonus = 0, defBonus = 0, hpBonus = 0, mpBonus = 0, spdBonus = 0;
      for (const b of combatData.buffs) {
        if (b.stat === 'attack') atkBonus += b.amount;
        if (b.stat === 'defense') defBonus += b.amount;
        if (b.stat === 'hp') hpBonus += b.amount;
        if (b.stat === 'mp') mpBonus += b.amount;
        if (b.stat === 'speed') spdBonus += b.amount;
      }
      for (const d of combatData.debuffs) {
        if (d.stat === 'attack') atkBonus += d.amount;
        if (d.stat === 'defense') defBonus += d.amount;
        if (d.stat === 'hp') hpBonus += d.amount;
        if (d.stat === 'mp') mpBonus += d.amount;
        if (d.stat === 'speed') spdBonus += d.amount;
      }
      return { attack: atkBonus, defense: defBonus, hp: hpBonus, mp: mpBonus, speed: spdBonus };
    }

    function getBonusWithBuffs() {
      const buffBonus = getBuffBonus();
      return {
        attack: bonus.attack + buffBonus.attack,
        defense: bonus.defense + buffBonus.defense,
        hp: bonus.hp + buffBonus.hp,
        mp: bonus.mp + buffBonus.mp,
        speed: bonus.speed + buffBonus.speed,
        summonBoost: bonus.summonBoost
      };
    }

    const floorName = FLOOR_NAMES[floor] || `Tầng ${floor}`;
    const floorDesc = FLOOR_DESCRIPTIONS[floor] || 'Hầm ngục bí ẩn.';
    const totalMonsters = 1 + monsterQueue.length;
    const monsterTitle = totalMonsters > 1 ? `${monster.emoji} ${monster.name} + ${monsterQueue.length} quái khác (${totalMonsters} quái)` : `${monster.emoji} ${monster.name}${monster.isBoss ? ' (BOSS!)' : ''}`;

    const embed = new EmbedBuilder()
      .setTitle(`🏰 Dungeon - Tầng ${floor}: ${floorName}`)
      .setDescription(floorDesc)
      .addFields(
        {
          name: monsterTitle,
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
      new ButtonBuilder().setCustomId('skill').setLabel('✨ Kỹ Năng').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('potion').setLabel('🧪 Thuốc').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('flee').setLabel('🏃 Chạy Trốn').setStyle(ButtonStyle.Secondary)
    );

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

      if (i.customId === 'potion') {
        if (combatData.potionUsed >= POTION_LIMIT) {
          await showCombatStatus(i, player, combatData.monster, `❌ Đã dùng tối đa **${POTION_LIMIT}** thuốc trong combat này!`, combatData.skillUsage, combatData.summon, combatData.events);
          return;
        }

        const potions = player.inventory.items.filter((inv: any) => {
          const item = ITEMS[inv.itemId];
          return item && item.type === 'potion' && inv.quantity > 0 && item.id !== 'exp_boost_potion';
        });

        if (potions.length === 0) {
          await showCombatStatus(i, player, combatData.monster, '❌ Không có thuốc nào trong túi!', combatData.skillUsage, combatData.summon, combatData.events);
          return;
        }

        const potionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        potionRow.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('potion_select')
            .setPlaceholder('Chọn thuốc...')
            .addOptions(
              potions.slice(0, 25).map((inv: any) => {
                const item = ITEMS[inv.itemId];
                return {
                  label: `${item.emoji} ${item.name} x${inv.quantity}`.substring(0, 100),
                  value: item.id,
                  description: item.description.substring(0, 100)
                };
              })
            )
        );

        await i.message.edit({
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setCustomId('attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
              new ButtonBuilder().setCustomId('skill').setLabel('✨ Kỹ Năng').setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setCustomId('potion').setLabel('🧪 Thuốc').setStyle(ButtonStyle.Success),
              new ButtonBuilder().setCustomId('flee').setLabel('🏃 Chạy Trốn').setStyle(ButtonStyle.Secondary)
            ),
            potionRow
          ]
        });

        const potionCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 30000
        });

        potionCollector.on('collect', async (pi: any) => {
          if (pi.user.id !== userId) return;

          const potionId = pi.values[0];
          const potionItem = ITEMS[potionId];
          const invItem = player.inventory.items.find((inv: any) => inv.itemId === potionId);

          if (!potionItem || !invItem || invItem.quantity <= 0) {
            await pi.deferUpdate();
            potionCollector.stop();
            return;
          }

          removeItem(player.inventory, potionId, 1);
          combatData.potionUsed++;

          let potionMsg = '';

          if (potionItem.healAmount) {
            const isHeal = potionItem.id.includes('mana') || potionItem.id === 'elixir';
            if (potionItem.id === 'elixir') {
              player.stats.hp = Math.min(player.stats.maxHP + bonus.hp, player.stats.hp + potionItem.healAmount);
              player.stats.mp = Math.min(player.stats.maxMP + bonus.mp, player.stats.mp + 100);
              potionMsg = `✨ Elixir hồi **200 HP** và **100 MP**!`;
            } else if (isHeal) {
              player.stats.mp = Math.min(player.stats.maxMP + bonus.mp, player.stats.mp + potionItem.healAmount);
              potionMsg = `💧 Hồi **${potionItem.healAmount}** MP!`;
            } else {
              const healAmt = Math.min(potionItem.healAmount, (player.stats.maxHP + bonus.hp) - player.stats.hp);
              player.stats.hp += healAmt;
              potionMsg = `❤️ Hồi **${healAmt}** HP!`;
            }
          } else if (potionItem.buffStat) {
            combatData.buffs.push({ stat: potionItem.buffStat, amount: potionItem.buffAmount || 0 });
            potionMsg = `⬆️ Tăng **${potionItem.buffStat.toUpperCase()} +${potionItem.buffAmount}** trong combat!`;
            if (potionItem.debuffStat) {
              combatData.debuffs.push({ stat: potionItem.debuffStat, amount: potionItem.debuffAmount || 0 });
              potionMsg += `\n⬇️ Giảm **${potionItem.debuffStat.toUpperCase()} ${potionItem.debuffAmount}**`;
            }
          }

          const result = executeCombatRound(player.stats, combatData.monster, undefined, getBonusWithBuffs(), combatData.summon, 1, combatData.events, combatData.stunTurns);
          combatData.stunTurns = result.stunTurns;

          if (result.monsterDied || result.playerDied) {
            if (result.playerDied || combatData.monsterQueue.length === 0) {
              combatData.active = false;
              collector.stop();
            }
          }

          if (combatData.summon && result.summonDied) {
            combatData.summon = null;
          }

          const fullMsg = `🧪 Dùng ${potionItem.emoji} **${potionItem.name}**\n${potionMsg}\n\n${result.message}`;

          if (result.monsterDied) {
            if (combatData.monsterQueue.length > 0) {
              combatData.monster = combatData.monsterQueue.shift()!;
              combatData.skillUsage = {};
              const nextMsg = `${fullMsg}\n\n⚔️ **Quái tiếp theo:** ${combatData.monster.emoji} ${combatData.monster.name} (${combatData.monster.hp}/${combatData.monster.maxHP} HP)`;
              const embed = buildCombatEmbed(player, combatData.monster, nextMsg, combatData.skillUsage, combatData.summon, combatData.events);
              await pi.update({ embeds: [embed], components: [buildCombatButtons()] });
            } else {
              const totalExp = result.expGained;
              const totalGold = result.goldGained;
              let expBoostMsg = '';
              if (player.expBoostCharges > 0) {
                player.expBoostCharges--;
                expBoostMsg = ` (x2 EXP, còn ${player.expBoostCharges} lượt)`;
              }
              const expResult = await db.addExp(player, totalExp);
              await db.addGold(player, totalGold);
              let gemsEarned = combatData.monster.isBoss ? 10 + Math.floor(Math.random() * 40) : combatData.monster.level >= 10 ? 5 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 3);
              if (gemsEarned > 0) await db.addGems(player, gemsEarned);
              if (result.itemDropped) { addItem(player.inventory, result.itemDropped); const gemBonus = Math.floor(Math.random() * 10) + 5; await db.addGems(player, gemBonus); gemsEarned += gemBonus; }
              if (combatData.monster.isBoss) { const chest = rollChest(combatData.floor); if (chest) { await db.addChest(player, chest.id); } }
              if (combatData.floor >= player.highestFloor) { player.highestFloor = combatData.floor + 1; player.dungeon.currentFloor = combatData.floor + 1; }
              player.totalMonstersKilled += 1;
              await db.updatePlayer(player);
              let msg = `⚔️ **CHIẾN THẮNG!**\n🧪 Dùng ${potionItem.emoji} **${potionItem.name}**\n${potionMsg}\n\n+${totalExp * (result.expGained > 0 ? 1 : 1)} EXP, +${totalGold} Gold${expBoostMsg}\n💎 +${gemsEarned} Gem`;
              if (expResult.leveled) { const levelGems = expResult.levelsGained * 5; await db.addGems(player, levelGems); msg += `\n\n🎉 **LEVEL UP!** Level ${player.stats.level} (+${expResult.levelsGained})`; }
              const victoryEmbed = new EmbedBuilder().setTitle('🏆 Chiến Thắng!').setDescription(msg).setColor(0x00FF00);
              await pi.update({ embeds: [victoryEmbed], components: [] });
            }
          } else if (result.playerDied) {
            await db.updatePlayer(player);
            await pi.update({ content: `💀 **GAME OVER**\n${fullMsg}`, embeds: [], components: [] });
          } else {
            const embed = buildCombatEmbed(player, combatData.monster, fullMsg, combatData.skillUsage, combatData.summon, combatData.events, combatData.buffs);
            await pi.update({ embeds: [embed], components: [buildCombatButtons()] });
          }
          potionCollector.stop();
        });

        return;
      }

      if (i.customId === 'flee') {
        const fleeChance = player.stats.speed / (player.stats.speed + combatData.monster.speed);
        if (Math.random() < fleeChance) {
          combatData.active = false;
          activeCombats.delete(userId);
          collector.stop();
          await i.message.edit({ content: '🏃 Chạy trốn thành công!', embeds: [], components: [] });
        } else {
          const result = executeCombatRound(player.stats, combatData.monster, undefined, getBonusWithBuffs(), combatData.summon, 1, combatData.events, combatData.stunTurns);
          combatData.stunTurns = result.stunTurns;
          if (result.playerDied) {
            combatData.active = false;
            activeCombats.delete(userId);
            collector.stop();
            await db.updatePlayer(player);
            await i.message.edit({ content: `💀 Bị tiêu diệt!\n${result.message}`, embeds: [], components: [] });
          } else if (result.monsterDied) {
            combatData.active = false;
            collector.stop();
            await handleVictory(i, player, combatData, db, result);
          } else {
            await showCombatStatus(i, player, combatData.monster, `🏃 Không chạy được!\n${result.message}`, combatData.skillUsage, combatData.summon, combatData.events);
          }
        }
        return;
      }

      if (i.customId === 'skill') {
        const availableSkills = getAvailableSkills(player);
        
        if (availableSkills.length === 0) {
          await showCombatStatus(i, player, combatData.monster, '❌ Không có kỹ năng nào khả dụng (hết MP hoặc chưa học)!', combatData.skillUsage, combatData.summon, combatData.events);
          return;
        }

        const isSummoner = player.characterClass === 'summoner';
        const usableSkills = availableSkills.filter(s => {
          const used = combatData.skillUsage[s.id] || 0;
          const limit = isSummoner ? SUMMONER_SKILL_LIMIT : SKILL_LIMIT;
          return used < limit;
        });

        if (usableSkills.length === 0) {
          await showCombatStatus(i, player, combatData.monster, '❌ Hết lượt sử dụng kỹ năng trong lượt này!', combatData.skillUsage, combatData.summon, combatData.events);
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
                const limit = isSummoner ? SUMMONER_SKILL_LIMIT : SKILL_LIMIT;
                const mpCost = isSummoner ? s.manaCost * 3 : s.manaCost;
                const isSummonSkill = SUMMON_SKILL_IDS.includes(s.id);
                const label = isSummonSkill ? `${s.emoji} ${s.name} (${mpCost} MP) [${limit - used}]` : `${s.name} (${mpCost} MP) [${limit - used}]`;
                return {
                  label: label.substring(0, 100),
                  value: s.id,
                  description: s.description.substring(0, 100)
                };
              })
            )
        );

        await i.message.edit({
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
          const mpMultiplier = isSummoner ? 3 : 1;

          if (skill && player.stats.mp >= skill.manaCost * mpMultiplier) {
            player.stats.mp -= skill.manaCost * mpMultiplier;
            combatData.skillUsage[skillId] = (combatData.skillUsage[skillId] || 0) + 1;

            // Handle summon creation
            if (SUMMON_SKILL_IDS.includes(skillId)) {
              if (!combatData.summon || combatData.summon.hp <= 0) {
                combatData.summon = createSummon(skillId, player.stats.level, bonus.summonBoost);
                if (combatData.summon) {
                  await showCombatStatus(i, player, combatData.monster, `${combatData.summon.emoji} **${combatData.summon.name}** (Lv.${combatData.summon.level}) đã được triệu hồi!\n❤️ HP: ${combatData.summon.hp}/${combatData.summon.maxHP} | ⚔️ ATK: ${combatData.summon.attack}`, combatData.skillUsage, combatData.summon, combatData.events);
                  skillCollector.stop();
                  return;
                }
              } else {
                await showCombatStatus(i, player, combatData.monster, '❌ Đã có triệu hồi trên sân! Triệu hồi khác khi nó chết.', combatData.skillUsage, combatData.summon, combatData.events);
                skillCollector.stop();
                return;
              }
            }
          }

          const result = executeCombatRound(player.stats, combatData.monster, skill, getBonusWithBuffs(), combatData.summon, mpMultiplier, combatData.events, combatData.stunTurns);
          combatData.stunTurns = result.stunTurns;

          if (combatData.floor >= 20 && !result.monsterDied && !result.playerDied) {
            rollForEvent(combatData.floor, combatData.events);
          }

          if (result.monsterDied || result.playerDied) {
            if (result.playerDied || combatData.monsterQueue.length === 0) {
              combatData.active = false;
              collector.stop();
            }
          }

          if (combatData.summon && result.summonDied) {
            combatData.summon = null;
          }

          await processResult(si, player, combatData, db, result);
          skillCollector.stop();
        });

        return;
      }

      const isSummoner = player.characterClass === 'summoner';
      const mpMultiplier = isSummoner ? 3 : 1;
      const result = executeCombatRound(player.stats, combatData.monster, undefined, getBonusWithBuffs(), combatData.summon, mpMultiplier, combatData.events, combatData.stunTurns);
      combatData.stunTurns = result.stunTurns;

      if (combatData.floor >= 20 && !result.monsterDied && !result.playerDied) {
        rollForEvent(combatData.floor, combatData.events);
      }

      if (result.monsterDied || result.playerDied) {
        if (result.playerDied || combatData.monsterQueue.length === 0) {
          combatData.active = false;
          collector.stop();
        }
      }

      // Update summon state
      if (combatData.summon && result.summonDied) {
        combatData.summon = null;
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

async function processResult(i: any, player: any, combatData: CombatData, db: Database, result: any, extraMsg?: string) {
  const msg = extraMsg ? `${extraMsg}\n\n${result.message}` : result.message;
  if (result.monsterDied) {
    if (combatData.monsterQueue.length > 0) {
      combatData.monster = combatData.monsterQueue.shift()!;
      combatData.skillUsage = {};
      const nextMsg = `${msg}\n\n⚔️ **Quái tiếp theo:** ${combatData.monster.emoji} ${combatData.monster.name} (${combatData.monster.hp}/${combatData.monster.maxHP} HP)`;
      await showCombatStatus(i, player, combatData.monster, nextMsg, combatData.skillUsage, combatData.summon, combatData.events);
    } else {
      await handleVictory(i, player, combatData, db, result);
    }
  } else if (result.playerDied) {
    await db.updatePlayer(player);
    await i.message.edit({ content: `💀 **GAME OVER**\n${msg}`, embeds: [], components: [] });
  } else {
    await showCombatStatus(i, player, combatData.monster, msg, combatData.skillUsage, combatData.summon, combatData.events);
  }
}

async function handleVictory(i: any, player: any, combatData: any, db: Database, result: any) {
  const monstersKilled = 1 + combatData.monsterQueue.length;
  let totalExp = result.expGained * monstersKilled;
  const totalGold = result.goldGained * monstersKilled;

  let expBoostMsg = '';
  if (player.expBoostCharges > 0) {
    totalExp *= 2;
    player.expBoostCharges--;
    expBoostMsg = ` (x2 EXP, còn ${player.expBoostCharges} lần)`;
  }

  const expResult = await db.addExp(player, totalExp);
  await db.addGold(player, totalGold);

  let gemsEarned = 0;
  if (combatData.monster.isBoss) {
    gemsEarned = 10 + Math.floor(Math.random() * 40);
  } else if (combatData.monster.level >= 10) {
    gemsEarned = 5 + Math.floor(Math.random() * 10);
  } else {
    gemsEarned = Math.floor(Math.random() * 3);
  }
  gemsEarned *= monstersKilled;

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

  player.totalMonstersKilled += monstersKilled;
  await db.updatePlayer(player);

  let msg = `⚔️ **CHIẾN THẮNG!**`;
  if (monstersKilled > 1) {
    msg += `\nĐánh bại **${monstersKilled}** quái!`;
  }
  msg += `\n+${totalExp} EXP, +${totalGold} Gold${expBoostMsg}`;
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

  await i.message.edit({ embeds: [embed], components: [] });
}

function buildCombatButtons(): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder().setCustomId('attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('skill').setLabel('✨ Kỹ Năng').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('potion').setLabel('🧪 Thuốc').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('flee').setLabel('🏃 Chạy Trốn').setStyle(ButtonStyle.Secondary)
  );
  return row;
}

function buildCombatEmbed(player: any, monster: Monster, extraMessage?: string, skillUsage?: Record<string, number>, summon?: Summon | null, events?: ActiveEvents, buffs?: CombatBuff[]): EmbedBuilder {
  const bonus = calculateBonusStats(player.inventory, player.equippedPet);
  const totalHP = player.stats.maxHP + bonus.hp;
  const totalMP = player.stats.maxMP + bonus.mp;

  const monsterBar = generateProgressBar(monster.hp, monster.maxHP, 15);
  const playerBar = generateProgressBar(player.stats.hp, totalHP, 15);

  let description = extraMessage || '';
  if (events && events.events.length > 0) {
    const eventMsgs = getEventMessages(events);
    description += `\n\n⚡ **Sự kiện:**\n${eventMsgs.join('\n')}`;
  }
  if (buffs && buffs.length > 0) {
    const buffMsgs = buffs.map(b => `⬆️ ${b.stat.toUpperCase()} +${b.amount}`);
    description += `\n\n🧪 **Buff:** ${buffMsgs.join(', ')}`;
  }

  const embed = new EmbedBuilder()
    .setTitle('⚔️ Combat')
    .setDescription(description)
    .addFields(
      { name: `${monster.emoji} ${monster.name}`, value: `❤️ ${monster.hp}/${monster.maxHP}\n${monsterBar}`, inline: true },
      { name: '👤 Bạn', value: `❤️ ${player.stats.hp}/${totalHP} | 💧 ${player.stats.mp}/${totalMP}\n${playerBar}`, inline: true }
    )
    .setColor(0xFF6600);

  if (summon && summon.hp > 0) {
    const summonBar = generateProgressBar(summon.hp, summon.maxHP, 15);
    embed.addFields({
      name: `${summon.emoji} ${summon.name} (Lv.${summon.level} Triệu Hồi)`,
      value: `❤️ ${summon.hp}/${summon.maxHP}\n⚔️ ATK: ${summon.attack} | 🛡️ DEF: ${summon.defense}\n${summonBar}`,
      inline: true
    });
  }

  return embed;
}

async function showCombatStatus(i: any, player: any, monster: Monster, extraMessage?: string, skillUsage?: Record<string, number>, summon?: Summon | null, events?: ActiveEvents, buffs?: CombatBuff[]) {
  const embed = buildCombatEmbed(player, monster, extraMessage, skillUsage, summon, events, buffs);
  const row = buildCombatButtons();
  await i.message.edit({ embeds: [embed], components: [row] });
}
