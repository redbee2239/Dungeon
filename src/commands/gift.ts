import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

export const prefixCommand = {
  name: 'gift',
  aliases: ['tangqua'],
  description: 'Tặng quà cho người chơi khác',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const sender = await db.getPlayer(userId);

    if (!sender) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create`.');
    }

    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply('❌ Cúng phải tag người nhận!\nCách dùng: `,gift @user <gold/gem> <số lượng>`');
    }

    if (targetUser.id === userId) {
      return message.reply('❌ Không thể tự tặng quà cho bản thân!');
    }

    const target = await db.getPlayer(targetUser.id);
    if (!target) {
      return message.reply(`❌ ${targetUser.username} chưa có nhân vật!`);
    }

    const type = args[1]?.toLowerCase();
    if (!type || (type !== 'gold' && type !== 'gem')) {
      return message.reply('❌ Loại phải là `gold` hoặc `gem`!\nCách dùng: `,gift @user <gold/gem> <số lượng>`');
    }

    const amount = parseInt(args[2]);
    if (!amount || amount <= 0) {
      return message.reply('❌ Số lượng phải là số dương!');
    }

    if (type === 'gold' && sender.stats.gold < amount) {
      return message.reply(`❌ Bạn chỉ có **${sender.stats.gold.toLocaleString()}** Gold!`);
    }

    if (type === 'gem' && sender.gems < amount) {
      return message.reply(`❌ Bạn chỉ có **${sender.gems}** Gem!`);
    }

    if (type === 'gold') {
      sender.stats.gold -= amount;
      await db.addGold(target, amount);
    } else {
      sender.gems -= amount;
      await db.addGems(target, amount);
    }

    await db.updatePlayer(sender);

    const emoji = type === 'gold' ? '💰' : '💎';
    const embed = new EmbedBuilder()
      .setTitle('🎁 Tặng Quà Thành Công!')
      .setDescription(
        `<@${userId}> đã tặng **${targetUser.username}**:\n` +
        `${emoji} **${amount.toLocaleString()}** ${type === 'gold' ? 'Gold' : 'Gem'}`
      )
      .setColor(0x00FF00);

    message.reply({ embeds: [embed] });
  }
};
