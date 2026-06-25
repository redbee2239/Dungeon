import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

export const prefixCommand = {
  name: 'balance',
  description: 'Xem số dư',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const embed = new EmbedBuilder()
      .setTitle('💰 Số Dư')
      .setDescription(
        `💰 Gold: **${player.stats.gold}**\n` +
        `💎 Gem: **${player.gems}**`
      )
      .addFields(
        { 
          name: '📊 Thống Kê', 
          value: [
            `Tổng gold kiếm được: ${player.totalGoldEarned}`,
            `Gem đã dùng: ${player.gachaHistory.length}`,
            `Kỹ năng đã mở: ${player.unlockedSkills.length}/20`
          ].join('\n'),
          inline: true
        },
        {
          name: '💎 Cách Kiếm Gem',
          value: [
            '- Up level: +5 💎/level',
            '- Đánh boss: +10-50 💎',
            '- Bán item rare: +5-20 💎'
          ].join('\n'),
          inline: true
        }
      )
      .setColor(0xFFD700);

    message.reply({ embeds: [embed] });
  }
};
