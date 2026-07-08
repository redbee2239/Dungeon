import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { RECIPES, findRecipe, canCraft, craftItem, CraftingRecipe } from '../game/crafting';
import { MATERIALS } from '../game/materials';
import { ITEMS, RARITY_NAMES } from '../game/items';
import { getItemCount } from '../game/inventory';
import { isBeta, isSecretChannel } from '../game/beta';

function getMatName(id: string): string {
  if (ITEMS[id]) return `${ITEMS[id].emoji} ${ITEMS[id].name}`;
  if (MATERIALS[id]) return `${MATERIALS[id].emoji} ${MATERIALS[id].name}`;
  return id;
}

function buildRecipeEmbed(player: any, recipes: CraftingRecipe[], page: number, total: number): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`🔨 Chế Tạo (Trang ${page + 1}/${total})`)
    .setDescription(`💰 Gold: **${player.stats.gold}**\nDùng \`,craft <recipe_id>\` để chế tạo.`)
    .setColor(0xFFD700);

  for (const recipe of recipes) {
    const resultItem = ITEMS[recipe.result];
    const resultEmoji = resultItem?.emoji || '❓';
    const resultName = resultItem?.name || recipe.result;
    const rarity = resultItem ? RARITY_NAMES[resultItem.rarity] : '';

    const mats = recipe.materials.map(m => {
      const have = getItemCount(player.inventory, m.itemId);
      const check = have >= m.quantity ? '✅' : '❌';
      return `${check} ${getMatName(m.itemId)} x${m.quantity} (${have})`;
    }).join('\n');

    const goldCheck = player.stats.gold >= recipe.goldCost ? '✅' : '❌';
    const can = canCraft(player, recipe);
    const status = can.ok ? '🟢' : '🔴';

    embed.addFields({
      name: `${status} ${recipe.emoji} ${recipe.name}`,
      value: `${rarity ? `[${rarity}] ` : ''}${resultEmoji} ${resultName} x${recipe.resultQuantity}\n\n${mats}\n💰${goldCheck} ${recipe.goldCost}G\n\`${recipe.id}\``,
      inline: true
    });
  }

  return embed;
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
      const PAGE_SIZE = 9;
      const pages: CraftingRecipe[][] = [];
      for (let i = 0; i < RECIPES.length; i += PAGE_SIZE) {
        pages.push(RECIPES.slice(i, i + PAGE_SIZE));
      }
      let currentPage = 0;

      const embed = buildRecipeEmbed(player, pages[currentPage], currentPage, pages.length);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('craft_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('craft_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(pages.length <= 1),
      );

      const reply = await message.reply({ embeds: [embed], components: pages.length > 1 ? [row] : [] });

      if (pages.length <= 1) return;

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      collector.on('collect', async (i: any) => {
        if (i.user.id !== userId) {
          return i.reply({ content: '❌ Không phải menu của bạn!', ephemeral: true });
        }

        if (i.customId === 'craft_prev' && currentPage > 0) {
          currentPage--;
        } else if (i.customId === 'craft_next' && currentPage < pages.length - 1) {
          currentPage++;
        }

        const newEmbed = buildRecipeEmbed(player, pages[currentPage], currentPage, pages.length);
        const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('craft_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
          new ButtonBuilder().setCustomId('craft_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === pages.length - 1),
        );

        await i.update({ embeds: [newEmbed], components: [newRow] });
      });

      return;
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
