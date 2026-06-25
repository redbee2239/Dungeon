import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { RARITY_NAMES, RARITY_COLORS, ITEMS, ItemRarity } from '../game/items';

const RARITY_EMOJI: Record<ItemRarity, string> = {
  common: '⚪',
  uncommon: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟠'
};

export const prefixCommand = {
  name: 'inventory',
  aliases: ['inv', 'bag'],
  description: 'Xem hành trang',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const { inventory } = player;
    const action = args[0]?.toLowerCase();

    if (action === 'equip' || action === 'wearing' || action === 'mang') {
      const equipped = inventory.equipped;
      const embed = new EmbedBuilder()
        .setTitle('👔 Trang Bị Đang Mang')
        .setColor(0xFFD700);

      const slots = [
        { type: 'weapon', name: '⚔️ Vũ Khí', id: equipped.weapon },
        { type: 'armor', name: '🛡️ Giáp', id: equipped.armor },
        { type: 'accessory', name: '💍 Phụ Kiện', id: equipped.accessory }
      ];

      for (const slot of slots) {
        if (slot.id) {
          const item = ITEMS[slot.id];
          if (item) {
            const rarity = RARITY_NAMES[item.rarity];
            const rarityEmoji = RARITY_EMOJI[item.rarity];
            let statsText = '';
            if (item.stats) {
              statsText = Object.entries(item.stats)
                .filter(([_, v]) => v && v !== 0)
                .map(([k, v]) => `${k.toUpperCase()}: +${v}`)
                .join(', ');
            }
            embed.addFields({
              name: slot.name,
              value: `${rarityEmoji} **${item.name}** (${rarity})\n${item.emoji} ID: \`${item.id}\`\n${statsText || 'Không có stats'}`,
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

    const equippedCount = [inventory.equipped.weapon, inventory.equipped.armor, inventory.equipped.accessory].filter(Boolean).length;

    const embed = new EmbedBuilder()
      .setTitle('📦 Hành Trang')
      .setDescription(`${inventory.items.length}/${inventory.maxSlots} | 💰 ${player.stats.gold} Gold | 👔 Đang mang: ${equippedCount}/3`)
      .setColor(0xFFD700);

    for (const [type, items] of Object.entries(grouped)) {
      if (items.length === 0) continue;
      const value = items.map((i: any) => {
        const rarity = i.rarity as ItemRarity;
        const rarityEmoji = RARITY_EMOJI[rarity];
        const rarityName = RARITY_NAMES[rarity];
        return `${rarityEmoji} **${i.name}** x${i.quantity} (${rarityName}) | ID: \`${i.id}\``;
      }).join('\n');
      embed.addFields({ name: typeNames[type], value, inline: false });
    }

    embed.setFooter({ text: 'Dùng ,inventory equip để xem trang bị đang mang' });

    message.reply({ embeds: [embed] });
  }
};
