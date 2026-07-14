import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } from 'discord.js';
import { Database } from '../game/database';
import { calculateBonusStats, removeItem, getEquippedEffects } from '../game/inventory';
import { ITEMS } from '../game/items';
import { getSkillsForClass, Skill } from '../game/skills';
import { CLASS_DATA } from '../game/classes';

const TURN_TIME = 20000;
const POTION_LIMIT = 2;

interface PvPPlayer {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  playerData: any;
  skillUsage: Record<string, number>;
  potionUsed: number;
}

interface PvPBattle {
  challenger: PvPPlayer;
  defender: PvPPlayer;
  currentTurn: 'challenger' | 'defender';
  active: boolean;
  message: any;
}

const activeBattles = new Map<string, PvPBattle>();
const pendingInvites = new Map<string, { challengerId: string; defenderId: string; channelId: string }>();

function generateProgressBar(current: number, max: number, length: number): string {
  const filled = Math.floor((current / max) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function buildCombatEmbed(battle: PvPBattle, extraMsg?: string): EmbedBuilder {
  const { challenger, defender, currentTurn } = battle;
  const turnName = currentTurn === 'challenger' ? challenger.name : defender.name;

  const embed = new EmbedBuilder()
    .setTitle('⚔️ PVP Battle!')
    .setDescription(extraMsg || `**Lượt của:** ${turnName}`)
    .addFields(
      {
        name: `👤 ${challenger.name} (Lv.${challenger.level})`,
        value: [
          `❤️ ${challenger.hp}/${challenger.maxHp} ${generateProgressBar(challenger.hp, challenger.maxHp, 10)}`,
          `💧 ${challenger.mp}/${challenger.maxMp}`,
          `⚔️ ${challenger.attack} | 🛡️ ${challenger.defense} | 💨 ${challenger.speed}`
        ].join('\n'),
        inline: true
      },
      {
        name: `👤 ${defender.name} (Lv.${defender.level})`,
        value: [
          `❤️ ${defender.hp}/${defender.maxHp} ${generateProgressBar(defender.hp, defender.maxHp, 10)}`,
          `💧 ${defender.mp}/${defender.maxMp}`,
          `⚔️ ${defender.attack} | 🛡️ ${defender.defense} | 💨 ${defender.speed}`
        ].join('\n'),
        inline: true
      }
    )
    .setColor(currentTurn === 'challenger' ? 0x3498DB : 0xE74C3C)
    .setFooter({ text: `⏱️ ${TURN_TIME / 1000} giây để hành động` });

  return embed;
}

function buildCombatButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('pvp_attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('pvp_skill').setLabel('✨ Kỹ Năng').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('pvp_potion').setLabel('🧪 Thuốc').setStyle(ButtonStyle.Success)
  );
}

function calculateDamage(attackerAtk: number, defenderDef: number, multiplier: number = 1): { damage: number; isCrit: boolean } {
  const baseDamage = Math.max(1, attackerAtk * multiplier - defenderDef / 2);
  const isCrit = Math.random() < 0.15;
  const critMult = isCrit ? 1.5 : 1;
  const variance = 0.8 + Math.random() * 0.4;
  return { damage: Math.floor(baseDamage * critMult * variance), isCrit };
}

function canDodge(attackerSpd: number, defenderSpd: number): boolean {
  const dodgeChance = Math.max(0, (defenderSpd - attackerSpd) * 0.003);
  return Math.random() < dodgeChance;
}

function getAvailableSkillsPvP(playerData: any): Skill[] {
  let unlocked = playerData.unlockedSkills || [];
  const starters: Record<string, string> = {
    warrior: 'basic_slash', mage: 'spark', rogue: 'quick_strike',
    cleric: 'holy_smite', gladiator: 'battle_cry', summoner: 'summon_wolf',
    archer: 'quick_shot', necromancer: 'death_coil'
  };
  const starter = starters[playerData.characterClass];
  if (starter && !unlocked.includes(starter)) {
    unlocked = [starter, ...unlocked];
  }
  const skills = getSkillsForClass(playerData.characterClass, playerData.stats.level);
  return skills.filter(s => unlocked.includes(s.id));
}

function createPvPPlayer(playerData: any): PvPPlayer {
  const bonus = calculateBonusStats(playerData.inventory, playerData.equippedPet);
  const maxHp = playerData.stats.maxHP + bonus.hp;
  const maxMp = playerData.stats.maxMP + bonus.mp;
  return {
    id: playerData.id,
    name: playerData.name,
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    attack: playerData.stats.attack + bonus.attack,
    defense: playerData.stats.defense + bonus.defense,
    speed: playerData.stats.speed + bonus.speed,
    level: playerData.stats.level,
    playerData,
    skillUsage: {},
    potionUsed: 0
  };
}

async function processTurnEnd(i: any, battle: PvPBattle, db: Database) {
  const { challenger, defender, currentTurn } = battle;
  const attacker = currentTurn === 'challenger' ? challenger : defender;
  const defenderPlayer = currentTurn === 'challenger' ? defender : challenger;

  if (defenderPlayer.hp <= 0) {
    battle.active = false;
    activeBattles.delete(challenger.id);
    activeBattles.delete(defender.id);

    const levelDiff = Math.abs(challenger.level - defender.level);
    let expMsg = '';
    if (levelDiff <= 10) {
      const winner = attacker;
      const loser = defender;
      const expReward = Math.floor(10 + winner.level * 5 + Math.random() * 20);
      await db.addExp(winner.playerData, expReward);
      await db.updatePlayer(winner.playerData);
      expMsg = `\n\n🎉 **${winner.name}** nhận **${expReward}** EXP!`;
    } else {
      expMsg = `\n\n⚠️ Chênh lệch cấp > 10, không nhận EXP.`;
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 PVP Kết Thúc!')
      .setDescription(
        `**${attacker.name}** chiến thắng!\n` +
        `${defender.name} đã bị hạ gục.${expMsg}`
      )
      .setColor(0x00FF00);

    await i.message.edit({ embeds: [embed], components: [] });
    return;
  }

  battle.currentTurn = currentTurn === 'challenger' ? 'defender' : 'challenger';
  const nextPlayer = battle.currentTurn === 'challenger' ? challenger : defender;

  const embed = buildCombatEmbed(battle);
  const row = buildCombatButtons();

  await i.message.edit({ embeds: [embed], components: [row] });

  const collector = i.message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: TURN_TIME
  });

  setupTurnCollector(collector, battle, db);
}

function setupTurnCollector(collector: any, battle: PvPBattle, db: Database) {
  const { currentTurn } = battle;
  const activePlayer = currentTurn === 'challenger' ? battle.challenger : battle.defender;
  const opponent = currentTurn === 'challenger' ? battle.defender : battle.challenger;

  collector.on('collect', async (i: any) => {
    if (i.user.id !== activePlayer.id) {
      return i.reply({ content: '❌ Không phải lượt của bạn!', ephemeral: true });
    }

    await i.deferUpdate();

    if (i.customId === 'pvp_potion') {
      if (activePlayer.potionUsed >= POTION_LIMIT) {
        await i.followUp({ content: `❌ Đã dùng tối đa ${POTION_LIMIT} thuốc!`, ephemeral: true });
        return;
      }

      const potions = activePlayer.playerData.inventory.items.filter((inv: any) => {
        const item = ITEMS[inv.itemId];
        return item && item.type === 'potion' && inv.quantity > 0 && item.healAmount;
      });

      if (potions.length === 0) {
        await i.followUp({ content: '❌ Không có thuốc!', ephemeral: true });
        return;
      }

      const potionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('pvp_potion_select')
          .setPlaceholder('Chọn thuốc...')
          .addOptions(potions.slice(0, 25).map((inv: any) => {
            const item = ITEMS[inv.itemId];
            return {
              label: `${item.emoji} ${item.name} x${inv.quantity}`.substring(0, 100),
              value: item.id,
              description: item.description.substring(0, 100)
            };
          }))
      );

      await i.message.edit({ components: [buildCombatButtons(), potionRow] });

      const potionCollector = i.message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 15000
      });

      potionCollector.on('collect', async (pi: any) => {
        if (pi.user.id !== activePlayer.id) return;
        await pi.deferUpdate();

        const potionId = pi.values[0];
        const potionItem = ITEMS[potionId];
        const invItem = activePlayer.playerData.inventory.items.find((inv: any) => inv.itemId === potionId);

        if (!potionItem || !invItem || invItem.quantity <= 0) {
          potionCollector.stop();
          return;
        }

        removeItem(activePlayer.playerData.inventory, potionId, 1);
        activePlayer.potionUsed++;

        if (potionItem.healAmount) {
          const healAmt = Math.min(potionItem.healAmount, activePlayer.maxHp - activePlayer.hp);
          activePlayer.hp += healAmt;
        }

        potionCollector.stop();
        await processTurnEnd(pi, battle, db);
      });

      potionCollector.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          await i.message.edit({ components: [buildCombatButtons()] });
        }
      });

      return;
    }

    if (i.customId === 'pvp_skill') {
      const availableSkills = getAvailableSkillsPvP(activePlayer.playerData);
      const usableSkills = availableSkills.filter(s => {
        const used = activePlayer.skillUsage[s.id] || 0;
        return used < 3 && activePlayer.mp >= s.manaCost;
      });

      if (usableSkills.length === 0) {
        await i.followUp({ content: '❌ Không có kỹ năng khả dụng!', ephemeral: true });
        return;
      }

      const skillRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('pvp_skill_select')
          .setPlaceholder('Chọn kỹ năng...')
          .addOptions(usableSkills.slice(0, 25).map(s => {
            const used = activePlayer.skillUsage[s.id] || 0;
            return {
              label: `${s.name} (${s.manaCost} MP) [${3 - used}]`.substring(0, 100),
              value: s.id,
              description: s.description.substring(0, 100)
            };
          }))
      );

      await i.message.edit({ components: [buildCombatButtons(), skillRow] });

      const skillCollector = i.message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 15000
      });

      skillCollector.on('collect', async (si: any) => {
        if (si.user.id !== activePlayer.id) return;
        await si.deferUpdate();

        const skillId = si.values[0];
        const skill = usableSkills.find(s => s.id === skillId);

        if (!skill || activePlayer.mp < skill.manaCost) {
          skillCollector.stop();
          return;
        }

        activePlayer.mp -= skill.manaCost;
        activePlayer.skillUsage[skillId] = (activePlayer.skillUsage[skillId] || 0) + 1;

        if (canDodge(activePlayer.speed, opponent.speed)) {
          skillCollector.stop();
          const embed = buildCombatEmbed(battle, `${activePlayer.name} dùng **${skill.name}** nhưng bị né!`);
          await si.message.edit({ embeds: [embed], components: [buildCombatButtons()] });
          const newCollector = si.message.createMessageComponentCollector({ componentType: ComponentType.Button, time: TURN_TIME });
          setupTurnCollector(newCollector, battle, db);
          return;
        }

        const { damage, isCrit } = calculateDamage(activePlayer.attack, opponent.defense, skill.damage);
        opponent.hp = Math.max(0, opponent.hp - damage);

        const critMsg = isCrit ? ' **CRIT!**' : '';
        const msg = `${activePlayer.name} dùng **${skill.name}**! Gây **${damage}** damage${critMsg}`;

        skillCollector.stop();
        await processTurnEnd(si, battle, db);
      });

      skillCollector.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          await i.message.edit({ components: [buildCombatButtons()] });
        }
      });

      return;
    }

    // Attack
    if (canDodge(activePlayer.speed, opponent.speed)) {
      const embed = buildCombatEmbed(battle, `${activePlayer.name} tấn công nhưng bị né!`);
      await i.message.edit({ embeds: [embed], components: [buildCombatButtons()] });
      const newCollector = i.message.createMessageComponentCollector({ componentType: ComponentType.Button, time: TURN_TIME });
      setupTurnCollector(newCollector, battle, db);
      return;
    }

    const { damage, isCrit } = calculateDamage(activePlayer.attack, opponent.defense);
    opponent.hp = Math.max(0, opponent.hp - damage);

    const critMsg = isCrit ? ' **CRIT!**' : '';
    const msg = `${activePlayer.name} tấn công! Gây **${damage}** damage${critMsg}`;

    await processTurnEnd(i, battle, db);
  });

  collector.on('end', async (_collected: any, reason: string) => {
    if (reason === 'time' && battle.active) {
      battle.active = false;
      const winner = activePlayer.id === battle.challenger.id ? battle.defender : battle.challenger;
      const loser = activePlayer;

      activeBattles.delete(battle.challenger.id);
      activeBattles.delete(battle.defender.id);

      const embed = new EmbedBuilder()
        .setTitle('⏰ Hết Giờ!')
        .setDescription(
          `**${loser.name}** không hành động đúng hạn!\n` +
          `**${winner.name}** chiến thắng!`
        )
        .setColor(0xFF0000);

      try {
        await battle.message.edit({ embeds: [embed], components: [] });
      } catch {}
    }
  });
}

export const prefixCommand = {
  name: 'pvp',
  description: 'Thách đấu PVP',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    if (player.stats.hp <= 0) {
      return message.reply('❌ Bạn đã chết! Dùng `,heal` để hồi phục.');
    }

    if (activeBattles.has(userId)) {
      return message.reply('❌ Bạn đang có battle chưa xong!');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Hãy @ người muốn thách đấu!');
    }

    if (target.id === userId) {
      return message.reply('❌ Không thể thách đấu chính mình!');
    }

    if (target.bot) {
      return message.reply('❌ Không thể thách đấu bot!');
    }

    const targetPlayer = await db.getPlayer(target.id);
    if (!targetPlayer) {
      return message.reply('❌ Người kia chưa có nhân vật!');
    }

    if (targetPlayer.stats.hp <= 0) {
      return message.reply('❌ Đối thủ đang chết, không thể thách đấu!');
    }

    if (activeBattles.has(target.id)) {
      return message.reply('❌ Đối thủ đang có battle khác!');
    }

    const inviteKey = `${userId}_${target.id}`;
    pendingInvites.set(inviteKey, { challengerId: userId, defenderId: target.id, channelId: message.channel.id });

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Thách Đấu PVP!')
      .setDescription(
        `**${player.name}** (Lv.${player.stats.level}) thách đấu **${targetPlayer.name}** (Lv.${targetPlayer.stats.level})!\n\n` +
        `${target.username} ấn nút để chấp nhận!`
      )
      .setColor(0xFF6600);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('pvp_accept').setLabel('✅ Chấp Nhận').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('pvp_decline').setLabel('❌ Từ Chối').setStyle(ButtonStyle.Secondary)
    );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000
    });

    collector.on('collect', async (i: any) => {
      if (i.user.id !== target.id) {
        return i.reply({ content: '❌ Chỉ người được thách đấu mới có thể chấp nhận!', ephemeral: true });
      }

      if (i.customId === 'pvp_decline') {
        pendingInvites.delete(inviteKey);
        await i.update({ content: '❌ Đối thủ từ chối thách đấu!', embeds: [], components: [] });
        collector.stop();
        return;
      }

      if (i.customId === 'pvp_accept') {
        pendingInvites.delete(inviteKey);
        collector.stop();

        const freshChallenger = await db.getPlayer(userId);
        const freshDefender = await db.getPlayer(target.id);
        if (!freshChallenger || !freshDefender) {
          await i.update({ content: '❌ Có lỗi xảy ra!', embeds: [], components: [] });
          return;
        }

        const challengerPvP = createPvPPlayer(freshChallenger);
        const defenderPvP = createPvPPlayer(freshDefender);

        const firstTurn = Math.random() < 0.5 ? 'challenger' : 'defender';
        const firstPlayer = firstTurn === 'challenger' ? challengerPvP : defenderPvP;

        const battle: PvPBattle = {
          challenger: challengerPvP,
          defender: defenderPvP,
          currentTurn: firstTurn,
          active: true,
          message: reply
        };

        activeBattles.set(userId, battle);
        activeBattles.set(target.id, battle);

        const coinEmbed = new EmbedBuilder()
          .setTitle('🪙 Tung Đồng Xu!')
          .setDescription(`**${firstPlayer.name}** được tấn công trước!`)
          .setColor(0xFFD700);

        await i.update({ embeds: [coinEmbed], components: [] });

        setTimeout(async () => {
          if (!battle.active) return;

          const combatEmbed = buildCombatEmbed(battle);
          const row = buildCombatButtons();
          await reply.edit({ embeds: [combatEmbed], components: [row] });

          const turnCollector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: TURN_TIME
          });

          setupTurnCollector(turnCollector, battle, db);
        }, 2000);
      }
    });

    collector.on('end', async (_collected: any, reason: string) => {
      if (reason === 'time') {
        pendingInvites.delete(inviteKey);
        await reply.edit({ content: '⏰ Hết thời gian! Đối thủ không phản hồi.', embeds: [], components: [] }).catch(() => {});
      }
    });
  }
};
