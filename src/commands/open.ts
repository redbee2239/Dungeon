import { EmbedBuilder } from 'discord.js';
import { isBeta, activateBeta, deactivateBeta } from '../game/beta';

const OWNER_ID = '1185140041022976083';

export const prefixCommand = {
  name: 'open',
  aliases: ['opentest'],
  description: 'Beta toggle',
  execute: async (message: any, args: string[]) => {
    if (message.author.id !== OWNER_ID) {
      return message.reply('❌ Chỉ bot owner mới dùng được lệnh này!');
    }

    const action = args[0]?.toLowerCase();

    if (action === '1.3' || action === 'on' || action === 'enable') {
      activateBeta();
      const embed = new EmbedBuilder()
        .setTitle('🔓 Beta Đã Kích Hoạt')
        .setDescription('Các tính năng beta version 1.3 đã được bật.')
        .setColor(0x00FF00);
      return message.reply({ embeds: [embed] });
    }

    if (action === 'close' || action === 'off' || action === 'disable') {
      deactivateBeta();
      const embed = new EmbedBuilder()
        .setTitle('🔒 Beta Đã Tắt')
        .setDescription('Các tính năng beta đã được tắt.')
        .setColor(0xFF0000);
      return message.reply({ embeds: [embed] });
    }

    const status = isBeta();
    const embed = new EmbedBuilder()
      .setTitle('📋 Trạng Thái Beta')
      .setDescription(`Beta: ${status ? '🟢 ĐANG BẬT' : '🔴 ĐÃ TẮT'}\n\nCách dùng:\n\`,open beta 1.3\` - Bật beta\n\`,open close\` - Tắt beta\n\`,open status\` - Xem trạng thái`)
      .setColor(status ? 0x00FF00 : 0xFF0000);
    return message.reply({ embeds: [embed] });
  }
};
