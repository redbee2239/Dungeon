import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { addItem } from '../game/inventory';
import { ITEMS } from '../game/items';

const CODES: Record<string, { gold: number; gems: number; items?: { id: string; qty: number }[] }> = {
  summerevent: {
    gold: 1000,
    gems: 200,
    items: [
      { id: 'health_potion', qty: 5 },
      { id: 'mana_potion', qty: 3 },
    ],
  },
};

export const prefixCommand = {
  name: 'code',
  aliases: ['giftcode', 'gift'],
  description: 'Nhập gift code',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const code = args[0]?.toLowerCase();

    if (!code) {
      return message.reply('❌ Dùng: `,code <mã>`');
    }

    const codeData = CODES[code];
    if (!codeData) {
      return message.reply('❌ Mã code không hợp lệ!');
    }

    if (!player.summerEvent) {
      player.summerEvent = {
        consecutiveDays: 0,
        lastDailyLogin: 0,
        claimedCode: false,
        minigameLastPlay: 0,
        minigameWins: 0,
      };
    }

    if (code === 'summerevent' && player.summerEvent.claimedCode) {
      return message.reply('❌ Bạn đã sử dụng code này rồi!');
    }

    await db.addGold(player, codeData.gold);
    await db.addGems(player, codeData.gems);

    let itemMsg = '';
    if (codeData.items) {
      for (const item of codeData.items) {
        const itemData = ITEMS[item.id];
        if (itemData) {
          addItem(player.inventory, itemData, item.qty);
          itemMsg += `\n🧪 +${item.qty}x ${itemData.name}`;
        }
      }
    }

    if (code === 'summerevent') {
      player.summerEvent.claimedCode = true;
    }

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('🎁 Gift Code')
      .setDescription(
        `✅ Mã **${code}** đã được sử dụng!\n\n` +
        `💰 +${codeData.gold} Gold\n` +
        `💎 +${codeData.gems} Gem` +
        itemMsg
      )
      .setColor(0x00FF00);

    message.reply({ embeds: [embed] });
  }
};
