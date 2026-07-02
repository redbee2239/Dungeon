import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { claimDailyLogin, isEventActive, getDaysRemaining, getEventDay, DAILY_LOGIN_REWARDS } from '../game/summerEvent';

export const prefixCommand = {
  name: 'login',
  aliases: ['dangnhap', 'daily', 'dl'],
  description: 'Đăng nhập nhận quà sự kiện Mùa Hè',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const result = await claimDailyLogin(db, player);

    if (!result.success) {
      return message.reply(result.message);
    }

    const eventDay = getEventDay();
    const daysLeft = getDaysRemaining();

    let progressDesc = '';
    for (let i = 1; i <= 15; i++) {
      const done = i < (player.summerEvent?.consecutiveDays || 0) + 1;
      const current = i === (player.summerEvent?.consecutiveDays || 0) + 1;
      const emoji = done ? '✅' : current ? '📍' : '⬜';
      const reward = DAILY_LOGIN_REWARDS[i - 1];
      const line = `${emoji} Day ${i}: 💰${reward.gold} 💎${reward.gems}`;
      progressDesc += line + '\n';
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 Mùa Hè Bùng Nổ - Đăng Nhập')
      .setDescription(result.message)
      .addFields(
        { name: '📊 Tiến Trình', value: progressDesc, inline: false }
      )
      .setColor(0xFFD700)
      .setFooter({ text: `Còn ${daysLeft} ngày | Event Day ${Math.min(eventDay, 15)}/15` });

    message.reply({ embeds: [embed] });
  }
};
