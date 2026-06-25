import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

export const prefixCommand = {
  name: 'leaderboard',
  description: 'Bảng xếp hạng',
  execute: async (message: any, args: string[], db: Database) => {
    const players = await db.getLeaderboard();

    if (players.length === 0) {
      return message.reply('📊 Chưa có người chơi nào!');
    }

    const medals = ['🥇', '🥈', '🥉'];
    const top10 = players.slice(0, 10);

    const leaderboard = top10.map((p, i) => {
      const medal = medals[i] || `**${i + 1}.**`;
      return `${medal} **${p.name}** - Lv.${p.stats.level} | Tầng ${p.highestFloor} | ${p.totalMonstersKilled} kills`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Bảng Xếp Hạng')
      .setDescription(leaderboard)
      .setColor(0xFFD700);

    message.reply({ embeds: [embed] });
  }
};
