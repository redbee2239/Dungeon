import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

const OWNER_ID = '1185140041022976083';

export const prefixCommand = {
  name: 'gopy',
  description: 'Góp ý cho bot',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    const suggestion = args.join(' ');
    if (!suggestion) {
      return message.reply({
        content: '❌ Dùng `,gopy <nội dung góp ý>`',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📩 Góp Ý Mới')
      .setDescription(suggestion)
      .addFields(
        { name: '👤 Từ', value: `${message.author.username} (${message.author.id})`, inline: true },
        { name: '📍 Server', value: message.guild?.name || 'DM', inline: true }
      )
      .setColor(0x0099FF)
      .setTimestamp();

    try {
      const owner = await message.client.users.fetch(OWNER_ID);
      await owner.send({ embeds: [embed] });
    } catch (e) {
      console.error('Không thể gửi DM cho owner:', e);
    }

    await message.reply({
      content: '✅ Đã gửi góp ý thành công! Cảm ơn bạn.',
      ephemeral: true
    });
  }
};
