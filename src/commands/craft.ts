import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { RECIPES, findRecipe, canCraft, craftItem } from '../game/crafting';
import { MATERIALS } from '../game/materials';
import { ITEMS, RARITY_NAMES } from '../game/items';
import { getItemCount } from '../game/inventory';
import { isBeta, isSecretChannel } from '../game/beta';

function getMatName(id: string): string {
  if (ITEMS[id]) return `${ITEMS[id].emoji} ${ITEMS[id].name}`;
  if (MATERIALS[id]) return `${MATERIALS[id].emoji} ${MATERIALS[id].name}`;
  return id;
}

export const prefixCommand = {
  name: 'craft',
  aliases: ['dney'],
  description: 'Chế tạo vật phẩm',
  execute: async (message: any, args: string[], db: Database) => {
    if (!isBeta() && !isSecretChannel(message.channel.id)) {
      return message.reply('❌ Tính năng này chưa được mở!');
    }

    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const recipeId = args[0]?.toLowerCase();

    if (!recipeId) {
      const embed = new EmbedBuilder()
        .setTitle('🔨 Chế Tạo')
        .setDescription(`💰 Gold: **${player.stats.gold}**\n\nDùng \`,craft <recipe_id>\` để chế tạo.`)
        .setColor(0xFFD700);

      for (const recipe of RECIPES) {
        const resultItem = ITEMS[recipe.result];
        const resultEmoji = resultItem?.emoji || '❓';
        const resultName = resultItem?.name || recipe.result;
        const rarity = resultItem ? RARITY_NAMES[resultItem.rarity] : '';

        const mats = recipe.materials.map(m => {
          const have = getItemCount(player.inventory, m.itemId);
          const check = have >= m.quantity ? '✅' : '❌';
          return `${check} ${getMatName(m.itemId)} x${m.quantity} (có ${have})`;
        }).join('\n');

        const goldCheck = player.stats.gold >= recipe.goldCost ? '✅' : '❌';

        const can = canCraft(player, recipe);
        const status = can.ok ? '🟢 Có thể chế' : '🔴 Thiếu nguyên liệu';

        embed.addFields({
          name: `${recipe.emoji} ${recipe.name} (${resultEmoji} ${resultName})`,
          value: `${rarity ? `[${rarity}] ` : ''}Số lượng: ${recipe.resultQuantity}\n\n**Nguyên liệu:**\n${mats}\n\n💰 Gold: ${goldCheck} ${recipe.goldCost}\n${status}\nID: \`${recipe.id}\``,
          inline: true
        });
      }

      return message.reply({ embeds: [embed] });
    }

    const recipe = findRecipe(recipeId);
    if (!recipe) {
      return message.reply('❌ Không tìm thấy công thức! Dùng `,craft` để xem danh sách.');
    }

    const result = craftItem(player, recipe);
    if (!result.success) {
      return message.reply(`❌ ${result.message}`);
    }

    await db.updatePlayer(player);

    const resultItem = result.item;
    const embed = new EmbedBuilder()
      .setTitle('✅ Chế Tạo Thành Công!')
      .setDescription(
        `${recipe.emoji} **${recipe.name}**\n\n` +
        `${resultItem?.emoji || ''} Nhận: **${resultItem?.name || recipe.result}** x${recipe.resultQuantity}\n` +
        `💰 Gold còn lại: **${player.stats.gold}**`
      )
      .setColor(0x00FF00);

    message.reply({ embeds: [embed] });
  }
};
