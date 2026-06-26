import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, ItemRarity, RARITY_NAMES, RARITY_COLORS } from '../game/items';
import { removeItem } from '../game/inventory';

const RARITY_OPTIONS: { value: ItemRarity; label: string; emoji: string }[] = [
  { value: 'common', label: 'Phổ Thông', emoji: '⚪' },
  { value: 'uncommon', label: 'Thông Thường', emoji: '🟢' },
  { value: 'rare', label: 'Hiếm', emoji: '🔵' },
  { value: 'epic', label: 'Sử Thi', emoji: '🟣' },
  { value: 'legendary', label: 'Huyền Thoại', emoji: '🟠' }
];

export const prefixCommand = {
  name: 'autosell',
  aliases: ['as', 'banhang'],
  description: 'Bán tự động vật phẩm theo rarity',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const rarityArg = args[0]?.toLowerCase() as ItemRarity;
    const rarityOption = RARITY_OPTIONS.find(r => r.value === rarityArg);

    if (!rarityOption) {
      const embed = new EmbedBuilder()
        .setTitle('🛒 Auto Sell')
        .setDescription(
          'Cách dùng: `,autosell <rarity>`\n\n' +
          '**Rarity:**\n' +
          RARITY_OPTIONS.map(r => `${r.emoji} \`,${r.value}\` - Bán tất cả ${r.label}`).join('\n') +
          '\n\n**Alias:** `,as` hoặc `,banhang`'
        )
        .setColor(0xFFCC00);

      return message.reply({ embeds: [embed] });
    }

    let totalGold = 0;
    let totalItems = 0;
    const soldItems: string[] = [];

    for (let i = player.inventory.items.length - 1; i >= 0; i--) {
      const invItem = player.inventory.items[i];
      const item = ITEMS[invItem.itemId];

      if (item && item.rarity === rarityOption.value) {
        const gold = item.sellPrice * invItem.quantity;
        totalGold += gold;
        totalItems += invItem.quantity;
        soldItems.push(`${item.emoji} ${item.name} x${invItem.quantity} → ${gold} gold`);
        player.inventory.items.splice(i, 1);
      }
    }

    if (totalItems === 0) {
      return message.reply(`❌ Không có vật phẩm **${rarityOption.label}** nào trong túi đồ!`);
    }

    player.stats.gold += totalGold;
    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('🛒 Auto Sell Thành Công!')
      .setDescription(
        `**${rarityOption.emoji} ${rarityOption.label}**\n\n` +
        soldItems.join('\n') +
        `\n\n💰 Tổng: **${totalGold}** gold`
      )
      .setColor(RARITY_COLORS[rarityOption.value]);

    message.reply({ embeds: [embed] });
  }
};
