import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { CHESTS, CHEST_RARITY_NAMES, CHEST_RARITY_COLORS, ChestRarity, openChest } from '../game/chests';

export const prefixCommand = {
  name: 'chest',
  description: 'Xem và mở rương',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['list', 'open', 'xem', 'mo'].includes(action)) {
      const embed = new EmbedBuilder()
        .setTitle('📦 Rương')
        .setDescription(
          '**Cách dùng:**\n' +
          '`chest list` - Xem danh sách rương\n' +
          '`chest open <id>` - Mở rương'
        )
        .setColor(0xFFD700);
      return message.reply({ embeds: [embed] });
    }

    if (action === 'list' || action === 'xem') {
      if (player.inventory.chests.length === 0) {
        return message.reply('📦 Bạn chưa có rương nào! Đánh boss để nhận rương.');
      }

      const embed = new EmbedBuilder()
        .setTitle('📦 Kho Rương')
        .setDescription(`Tổng: **${player.inventory.chests.length}** loại rương`)
        .setColor(0xFFD700);

      for (const chestItem of player.inventory.chests) {
        const chest = CHESTS[chestItem.chestId as ChestRarity];
        if (chest) {
          embed.addFields({
            name: `${chest.emoji} ${chest.name} x${chestItem.quantity}`,
            value: `**Rarity:** ${CHEST_RARITY_NAMES[chest.rarity]}\n_${chest.description}_\n\`ID: ${chest.id}\``,
            inline: true
          });
        }
      }

      return message.reply({ embeds: [embed] });
    }

    if (action === 'open' || action === 'mo') {
      const chestId = args[1]?.toLowerCase();
      if (!chestId) {
        return message.reply('❌ Dùng `,chest open <id>`\nXem danh sách bằng `,chest list`');
      }

      const chestItem = player.inventory.chests.find(c => c.chestId === chestId);
      if (!chestItem || chestItem.quantity <= 0) {
        return message.reply('❌ Bạn không có rương này!');
      }

      const chest = CHESTS[chestId as ChestRarity];
      if (!chest) {
        return message.reply('❌ Rương không hợp lệ!');
      }

      const reward = openChest(chest);
      
      chestItem.quantity -= 1;
      if (chestItem.quantity <= 0) {
        player.inventory.chests = player.inventory.chests.filter(c => c.chestId !== chestId);
      }

      await db.addGems(player, reward.gems);
      await db.addGold(player, reward.gold);

      const embed = new EmbedBuilder()
        .setTitle(`${chest.emoji} Mở Rương ${chest.name}!`)
        .setDescription(
          `**Phần thưởng:**\n\n` +
          `💎 +${reward.gems} Gem\n` +
          `💰 +${reward.gold} Gold`
        )
        .setColor(CHEST_RARITY_COLORS[chest.rarity])
        .setFooter({ text: `Rương còn lại: ${chestItem.quantity} | Gold: ${player.stats.gold} | Gem: ${player.gems}` });

      return message.reply({ embeds: [embed] });
    }
  }
};
