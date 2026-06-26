import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { CodeModel } from '../game/codeModel';

export const prefixCommand = {
  name: 'code',
  description: 'Nhập code nhận thưởng',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const code = args[0]?.toLowerCase();
    if (!code) {
      return message.reply('❌ Dùng: `,code <mã code>`');
    }

    try {
      let codeDoc = await CodeModel.findOne({ code });

      if (!codeDoc) {
        codeDoc = await CodeModel.create({
          code,
          usedBy: [],
          maxUses: 10,
          reward: 500
        });
      }

      if (codeDoc.usedBy.includes(userId)) {
        return message.reply('❌ Bạn đã sử dụng code này rồi!');
      }

      if (codeDoc.usedBy.length >= codeDoc.maxUses) {
        return message.reply('❌ Code đã hết lượt sử dụng!');
      }

      codeDoc.usedBy.push(userId);
      await codeDoc.save();

      await db.addGems(player, codeDoc.reward);

      const embed = new EmbedBuilder()
        .setTitle('🎁 Code Thành Công!')
        .setDescription(`Bạn nhận được **${codeDoc.reward}** 💎\n\nCode: \`${code}\`\nLượt còn lại: **${codeDoc.maxUses - codeDoc.usedBy.length}**/${codeDoc.maxUses}`)
        .setColor(0x00FF00);

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Code error:', error);
      message.reply('❌ Lỗi khi xử lý code!');
    }
  }
};
