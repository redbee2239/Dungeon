import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

const AFK_INTERVAL_MS = 5 * 60 * 1000;
const AFK_MAX_SP = 500;

export const prefixCommand = {
  name: 'afk',
  description: 'Bật/tắt trạng thái AFK (nhận 1 Skill Point mỗi 5 phút, tối đa 500)',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    if (player.afk?.isAfk) {
      const elapsed = Date.now() - (player.afk.startTime || 0);
      const intervals = Math.floor(elapsed / AFK_INTERVAL_MS);
      const spEarned = Math.min(intervals, AFK_MAX_SP);

      player.afk.isAfk = false;
      player.afk.startTime = 0;
      player.skillPoints += spEarned;

      await db.updatePlayer(player);

      const minutes = Math.floor(elapsed / 60000);
      const embed = new EmbedBuilder()
        .setTitle('⏰ Tắt AFK!')
        .setDescription(
          `Thời gian AFK: **${minutes}** phút\n` +
          `Nhận được: **${spEarned}** Skill Points` +
          (intervals >= AFK_MAX_SP ? `\n\n⚠️ Đạt giới hạn tối đa **${AFK_MAX_SP}** SP!` : '')
        )
        .setColor(0x00FF00);

      return message.reply({ embeds: [embed] });
    }

    if (player.dungeon.isActive) {
      return message.reply('❌ Bạn đang trong dungeon! Hãy thoát dungeon trước khi AFK.');
    }

    if (!player.afk) player.afk = { isAfk: false, startTime: 0 };
    player.afk.isAfk = true;
    player.afk.startTime = Date.now();

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('💤 Bật AFK!')
      .setDescription(
        'Bạn đã vào trạng thái AFK.\n\n' +
        '⏰ Mỗi **5 phút** nhận **1 Skill Point**.\n' +
        `⚠️ Tối đa **${AFK_MAX_SP}** Skill Points mỗi lần AFK.\n` +
        '⚔️ Không thể đánh dungeon khi AFK.\n' +
        '💡 Dùng `,afk` để tắt AFK và nhận điểm.'
      )
      .setColor(0x808080);

    message.reply({ embeds: [embed] });
  }
};
