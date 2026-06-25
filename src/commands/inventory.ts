import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { RARITY_NAMES, ItemRarity } from '../game/items';

export const prefixCommand = {
  name: 'inventory',
  description: 'Xem hành trang',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const { inventory } = player;

    if (inventory.items.length === 0) {
      return message.reply('📦 Hành trang trống! Đánh quái để nhặt đồ.');
    }

    const grouped: Record<string, any[]> = {
      weapon: [],
      armor: [],
      potion: [],
      accessory: []
    };

    inventory.items.forEach((i: any) => {
      const item = require('../game/items').ITEMS[i.itemId];
      if (item) {
        grouped[item.type]?.push({ ...item, quantity: i.quantity });
      }
    });

    const typeNames: Record<string, string> = {
      weapon: '⚔️ Vũ Khí',
      armor: '🛡️ Giáp',
      potion: '🧪 Thuốc',
      accessory: '💍 Phụ Kiện'
    };

    const embed = new EmbedBuilder()
      .setTitle('📦 Hành Trang')
      .setDescription(`${inventory.items.length}/${inventory.maxSlots} | 💰 ${player.stats.gold} Gold`)
      .setColor(0xFFD700);

    for (const [type, items] of Object.entries(grouped)) {
      if (items.length === 0) continue;
      const value = items.map((i: any) => {
        const rarity = RARITY_NAMES[i.rarity as ItemRarity];
        return `${i.emoji} **${i.name}** x${i.quantity} (${rarity}) | ID: \`${i.id}\``;
      }).join('\n');
      embed.addFields({ name: typeNames[type], value, inline: false });
    }

    message.reply({ embeds: [embed] });
  }
};
