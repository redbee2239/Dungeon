import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Database } from '../game/database';
import { getQuestById, shouldResetDaily, shouldResetWeekly, resetDailyQuests, resetWeeklyQuests, Quest, isWeekend, getDailyMultiplier } from '../game/quests';

export const prefixCommand = {
  name: 'quest',
  aliases: ['nhiemvu', 'daily'],
  description: 'Xem và nhận thưởng nhiệm vụ',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    if (!player.quests) {
      player.quests = { daily: [], dailyLastReset: 0, weekly: [], weeklyLastReset: 0 };
    }

    if (shouldResetDaily(player.quests.dailyLastReset)) {
      player.quests.daily = resetDailyQuests(player.quests.daily);
      player.quests.dailyLastReset = Date.now();
    }

    if (shouldResetWeekly(player.quests.weeklyLastReset)) {
      player.quests.weekly = resetWeeklyQuests(player.quests.weekly);
      player.quests.weeklyLastReset = Date.now();
    }

    if (player.quests.daily.length === 0) {
      player.quests.daily = resetDailyQuests([]);
      player.quests.dailyLastReset = Date.now();
    }
    if (player.quests.weekly.length === 0) {
      player.quests.weekly = resetWeeklyQuests([]);
      player.quests.weeklyLastReset = Date.now();
    }

    await db.updatePlayer(player);

    const action = args[0]?.toLowerCase();

    if (action === 'claim' || action === 'nhan') {
      return claimQuests(message, player, db);
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Nhiệm Vụ')
      .setColor(0xFFD700);

    let dailyDesc = '';
    for (const q of player.quests.daily) {
      const quest = getQuestById(q.questId);
      if (!quest) continue;
      const done = q.progress >= quest.target;
      const status = q.claimed ? '✅' : done ? '🎁' : '⏳';
      const bar = `(${Math.min(q.progress, quest.target)}/${quest.target})`;
      dailyDesc += `${status} ${quest.emoji} **${quest.name}** ${bar}\n`;
      dailyDesc += `   ${quest.description}\n`;
      if (!q.claimed && done) {
        const m = getDailyMultiplier();
        dailyDesc += `   💰 ${quest.reward.gold * m} Gold | 💎 ${quest.reward.gems * m} Gem | ⭐ ${quest.reward.exp * m} EXP`;
        if (isWeekend()) dailyDesc += ` **(x2 🎉)**`;
        dailyDesc += '\n';
      }
    }

    let weeklyDesc = '';
    for (const q of player.quests.weekly) {
      const quest = getQuestById(q.questId);
      if (!quest) continue;
      const done = q.progress >= quest.target;
      const status = q.claimed ? '✅' : done ? '🎁' : '⏳';
      const bar = `(${Math.min(q.progress, quest.target)}/${quest.target})`;
      weeklyDesc += `${status} ${quest.emoji} **${quest.name}** ${bar}\n`;
      weeklyDesc += `   ${quest.description}\n`;
      if (!q.claimed && done) {
        weeklyDesc += `   💰 ${quest.reward.gold} Gold | 💎 ${quest.reward.gems} Gem | ⭐ ${quest.reward.exp} EXP\n`;
      }
    }

    const weekendMsg = isWeekend() ? ' 🎉 **T7/CN x2 rewards!**' : '';
    embed.addFields(
      { name: `📅 Daily${weekendMsg}`, value: dailyDesc || 'Chưa có quest', inline: false },
      { name: '📆 Weekly (đổi mỗi tuần)', value: weeklyDesc || 'Chưa có quest', inline: false }
    );

    const hasClaimable = [...player.quests.daily, ...player.quests.weekly].some(q => {
      const quest = getQuestById(q.questId);
      return quest && !q.claimed && q.progress >= quest.target;
    });

    if (hasClaimable) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      row.addComponents(
        new ButtonBuilder().setCustomId('quest_claim').setLabel('🎁 Nhận Thưởng').setStyle(ButtonStyle.Success)
      );
      return message.reply({ embeds: [embed], components: [row] });
    }

    message.reply({ embeds: [embed] });
  }
};

async function claimQuests(message: any, player: any, db: Database) {
  let totalGold = 0;
  let totalGems = 0;
  let totalExp = 0;
  let claimed = 0;

  for (const q of [...player.quests.daily, ...player.quests.weekly]) {
    const quest = getQuestById(q.questId);
    if (!quest || q.claimed || q.progress < quest.target) continue;

    q.claimed = true;
    const m = quest.type === 'daily' ? getDailyMultiplier() : 1;
    totalGold += quest.reward.gold * m;
    totalGems += quest.reward.gems * m;
    totalExp += quest.reward.exp * m;
    claimed++;
  }

  if (claimed === 0) {
    return message.reply('❌ Không có quest nào cần nhận thưởng!');
  }

  if (totalGold > 0) await db.addGold(player, totalGold);
  if (totalGems > 0) await db.addGems(player, totalGems);
  if (totalExp > 0) await db.addExp(player, totalExp);

  await db.updatePlayer(player);

  const weekendBonus = isWeekend() ? '\n🎉 **T7/CN x2 Daily rewards!**' : '';

  const embed = new EmbedBuilder()
    .setTitle('🎁 Nhận Thưởng Nhiệm Vụ!')
    .setDescription(
      `Đã nhận **${claimed}** quest:\n` +
      (totalGold > 0 ? `💰 +${totalGold} Gold\n` : '') +
      (totalGems > 0 ? `💎 +${totalGems} Gem\n` : '') +
      (totalExp > 0 ? `⭐ +${totalExp} EXP\n` : '') +
      weekendBonus
    )
    .setColor(0x00FF00);

  message.reply({ embeds: [embed] });
}
