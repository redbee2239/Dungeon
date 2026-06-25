import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, RARITY_NAMES, ItemRarity, ItemType } from '../game/items';

export const prefixCommand = {
  name: 'equip',
  description: 'Trang bị vật phẩm',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['list', 'xem'].includes(action)) {
      const itemId = args[0]?.toLowerCase();
      if (!itemId) {
        const embed = new EmbedBuilder()
          .setTitle('⚔️ Trang Bị')
          .setDescription(
            'Cách dùng:\n' +
            '`,equip <id>` - Trang bị\n' +
            '`,unequip <weapon/armor/accessory>` - Tháo trang bị\n' +
            '`,equip list` - Xem trang bị'
          )
          .setColor(0xFF6600);
        return message.reply({ embeds: [embed] });
      }

      const item = ITEMS[itemId];
      if (!item) {
        return message.reply('❌ Không tìm thấy vật phẩm!');
      }

      if (item.type === 'potion') {
        return message.reply('❌ Không thể trang bị thuốc!');
      }

      const invItem = player.inventory.items.find((i: any) => i.itemId === itemId);
      if (!invItem || invItem.quantity <= 0) {
        return message.reply('❌ Bạn không có vật phẩm này!');
      }

      const equipType = item.type as 'weapon' | 'armor' | 'accessory';
      const currentlyEquipped = player.inventory.equipped[equipType];

      if (currentlyEquipped === itemId) {
        return message.reply('❌ Bạn đã trang bị vật phẩm này rồi!');
      }

      player.inventory.equipped[equipType] = itemId;
      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('✅ Trang Bị Thành Công!')
        .setDescription(
          `${item.emoji} **${item.name}**\n` +
          `Loại: ${equipType === 'weapon' ? '⚔️ Vũ khí' : equipType === 'armor' ? '🛡️ Giáp' : '💍 Phụ kiện'}\n` +
          `Rarity: ${RARITY_NAMES[item.rarity]}`
        )
        .setColor(0x00FF00);

      if (item.stats) {
        const stats = Object.entries(item.stats)
          .filter(([_, v]) => v && v !== 0)
          .map(([k, v]) => `${k.toUpperCase()}: +${v}`)
          .join('\n');
        if (stats) {
          embed.addFields({ name: '📊 Stats', value: stats, inline: true });
        }
      }

      return message.reply({ embeds: [embed] });
    }

    if (action === 'list' || action === 'xem') {
      const equipped = player.inventory.equipped;
      
      const embed = new EmbedBuilder()
        .setTitle('⚔️ Trang Bị Hiện Tại')
        .setColor(0xFF6600);

      const slots = [
        { type: 'weapon', name: '⚔️ Vũ khí', id: equipped.weapon },
        { type: 'armor', name: '🛡️ Giáp', id: equipped.armor },
        { type: 'accessory', name: '💍 Phụ kiện', id: equipped.accessory }
      ];

      for (const slot of slots) {
        if (slot.id) {
          const item = ITEMS[slot.id];
          if (item) {
            let statsText = '';
            if (item.stats) {
              statsText = Object.entries(item.stats)
                .filter(([_, v]) => v && v !== 0)
                .map(([k, v]) => `${k.toUpperCase()}: +${v}`)
                .join(', ');
            }
            embed.addFields({
              name: slot.name,
              value: `${item.emoji} **${item.name}** (${RARITY_NAMES[item.rarity]})\n${statsText || 'Không có stats'}`,
              inline: true
            });
          }
        } else {
          embed.addFields({
            name: slot.name,
            value: '*Trống*',
            inline: true
          });
        }
      }

      return message.reply({ embeds: [embed] });
    }
  }
};
