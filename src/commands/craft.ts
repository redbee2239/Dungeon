import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { RECIPES, findRecipe, canCraft, craftItem, CraftingRecipe } from '../game/crafting';
import { MATERIALS } from '../game/materials';
import { ITEMS, RARITY_NAMES, RARITY_COLORS } from '../game/items';
import { getItemCount } from '../game/inventory';

const CATEGORIES = [
  { id: 'all', label: '📋 Tất Cả', emoji: '📋', color: 0xFFD700 },
  { id: 'weapon', label: '⚔️ Vũ Khí', emoji: '⚔️', color: 0xE74C3C },
  { id: 'armor', label: '🛡️ Giáp', emoji: '🛡️', color: 0x3498DB },
  { id: 'accessory', label: '💍 Phụ Kiện', emoji: '💍', color: 0xF1C40F },
  { id: 'potion', label: '🧪 Thuốc', emoji: '🧪', color: 0x2ECC71 },
  { id: 'material', label: '🧱 Nguyên Liệu', emoji: '🧱', color: 0x95A5A6 }
];

function getMatName(id: string): string {
  if (ITEMS[id]) return `${ITEMS[id].emoji} ${ITEMS[id].name}`;
  if (MATERIALS[id]) return `${MATERIALS[id].emoji} ${MATERIALS[id].name}`;
  return id;
}

function progressBar(have: number, need: number): string {
  const ratio = Math.min(have / need, 1);
  const filled = Math.round(ratio * 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${have}/${need}`;
}

function buildRecipeEmbed(player: any, recipes: CraftingRecipe[], page: number, total: number, categoryId: string): EmbedBuilder {
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const embed = new EmbedBuilder()
    .setTitle(`${cat.emoji} Chế Tạo — Trang ${page + 1}/${total}`)
    .setDescription(
      `**💰 Gold:** ${player.stats.gold.toLocaleString()}\n` +
      `**📦 Công thức:** ${recipes.length} loại\n\n` +
      `🟢 = Đủ nguyên liệu | 🔴 = Thiếu`
    )
    .setColor(cat.color);

  for (const recipe of recipes) {
    const resultItem = ITEMS[recipe.result];
    const resultEmoji = resultItem?.emoji || '❓';
    const resultName = resultItem?.name || recipe.result;
    const rarity = resultItem ? resultItem.rarity : 'common';
    const rarityColor = RARITY_COLORS[rarity];

    const mats = recipe.materials.map(m => {
      const have = getItemCount(player.inventory, m.itemId);
      const ok = have >= m.quantity;
      return `${ok ? '🟢' : '🔴'} ${getMatName(m.itemId)}\n      └ ${progressBar(have, m.quantity)}`;
    }).join('\n');

    const goldOk = player.stats.gold >= recipe.goldCost;
    const can = canCraft(player, recipe);
    const status = can.ok ? '🟢' : '🔴';

    embed.addFields({
      name: `${status} ${recipe.emoji} ${recipe.name}`,
      value: [
        `${resultEmoji} **${resultName}** x${recipe.resultQuantity}`,
        rarity ? `*[${RARITY_NAMES[rarity]}]*` : '',
        '',
        mats,
        `${goldOk ? '🟢' : '🔴'} 💰 ${recipe.goldCost.toLocaleString()} Gold`,
        `\`${recipe.id}\``
      ].filter(Boolean).join('\n'),
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
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const recipeId = args[0]?.toLowerCase();

    if (!recipeId) {
      const PAGE_SIZE = 6;
      let currentCategory = 'all';
      let currentPage = 0;

      const getFiltered = () => {
        const all = currentCategory === 'all' ? RECIPES : RECIPES.filter(r => r.category === currentCategory);
        return all;
      };

      const getPages = (): CraftingRecipe[][] => {
        const filtered = getFiltered();
        const pages: CraftingRecipe[][] = [];
        for (let i = 0; i < filtered.length; i += PAGE_SIZE) {
          pages.push(filtered.slice(i, i + PAGE_SIZE));
        }
        return pages.length > 0 ? pages : [[]];
      };

      let pages = getPages();

      const embed = buildRecipeEmbed(player, pages[currentPage], currentPage, pages.length, currentCategory);

      const catRow = new ActionRowBuilder<StringSelectMenuBuilder>();
      catRow.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('craft_category')
          .setPlaceholder('📂 Chọn danh mục...')
          .addOptions(CATEGORIES.map(c => ({
            label: c.label,
            value: c.id,
            description: `${RECIPES.filter(r => c.id === 'all' || r.category === c.id).length} công thức`
          })))
      );

      const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('craft_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('craft_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(pages.length <= 1),
      );

      const components: any[] = [catRow];
      if (pages.length > 1 || true) components.push(navRow);

      const reply = await message.reply({ embeds: [embed], components });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      const catCollector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      catCollector.on('collect', async (ci: any) => {
        if (ci.user.id !== userId) {
          return ci.reply({ content: '❌ Không phải menu của bạn!', ephemeral: true });
        }
        await ci.deferUpdate();
        currentCategory = ci.values[0];
        currentPage = 0;
        pages = getPages();

        const newEmbed = buildRecipeEmbed(player, pages[currentPage], currentPage, pages.length, currentCategory);
        const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('craft_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
          new ButtonBuilder().setCustomId('craft_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= pages.length - 1),
        );
        await ci.message.edit({ embeds: [newEmbed], components: [catRow, newRow] });
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

        const newEmbed = buildRecipeEmbed(player, pages[currentPage], currentPage, pages.length, currentCategory);
        const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('craft_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
          new ButtonBuilder().setCustomId('craft_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= pages.length - 1),
        );

        await i.update({ embeds: [newEmbed], components: [catRow, newRow] });
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
    const rarity = resultItem?.rarity || 'common';
    const stats = resultItem?.stats;
    let statsText = '';
    if (stats) {
      const parts: string[] = [];
      if (stats.attack) parts.push(`⚔️ ATK +${stats.attack}`);
      if (stats.defense) parts.push(`🛡️ DEF +${stats.defense}`);
      if (stats.hp) parts.push(`❤️ HP +${stats.hp}`);
      if (stats.mp) parts.push(`💧 MP +${stats.mp}`);
      if (stats.speed) parts.push(`⚡ SPD +${stats.speed}`);
      statsText = parts.join(' | ');
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Chế Tạo Thành Công!')
      .setDescription(
        `${recipe.emoji} **${recipe.name}**\n\n` +
        `${resultItem?.emoji || ''} Nhận: **${resultItem?.name || recipe.result}** x${recipe.resultQuantity}\n` +
        (statsText ? `📊 ${statsText}\n` : '') +
        `\n💰 Gold còn lại: **${player.stats.gold.toLocaleString()}**`
      )
      .setColor(RARITY_COLORS[rarity])
      .setFooter({ text: `${RARITY_NAMES[rarity]} • Đã thêm vào hành trang` });

    message.reply({ embeds: [embed] });
  }
};
