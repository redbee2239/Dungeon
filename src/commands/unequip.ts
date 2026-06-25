import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS } from '../game/items';

export const prefixCommand = {
  name: 'unequip',
  description: 'Tháo trang bị',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const slot = args[0]?.toLowerCase();
    if (!slot || !['weapon', 'armor', 'accessory'].includes(slot)) {
      const embed = new EmbedBuilder()
        .setTitle('⚔️ Tháo Trang Bị')
        .setDescription(
          'Cách dùng:\n' +
          '`,unequip weapon` - Tháo vũ khí\n' +
          '`,unequip armor` - Tháo giáp\n' +
          '`,unequip accessory` - Tháo phụ kiện'
        )
        .setColor(0xFF6600);
      return message.reply({ embeds: [embed] });
    }

    const equipType = slot as 'weapon' | 'armor' | 'accessory';
    const equipped = player.inventory.equipped[equipType];

    if (!equipped) {
      return message.reply('❌ Không có trang bị nào ở vị trí này!');
    }

    const item = ITEMS[equipped];
    player.inventory.equipped[equipType] = null;
    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('✅ Tháo Trang Bị Thành Công!')
      .setDescription(
        `Đã tháo **${item?.emoji || '?'} ${item?.name || equipped}**`
      )
      .setColor(0x00FF00);

    message.reply({ embeds: [embed] });
  }
};
