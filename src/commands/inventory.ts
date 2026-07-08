import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { RARITY_NAMES, RARITY_COLORS, ITEMS, ItemRarity } from '../game/items';
import { MATERIALS } from '../game/materials';

const RARITY_EMOJI: Record<ItemRarity, string> = {
  common: '⚪',
  uncommon: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟠',
  limited: '🔴'
};

interface InventoryPage {
  name: string;
  emoji: string;
  filter: (item: any) => boolean;
}

const PAGES: InventoryPage[] = [
  { name: 'Nguyên Liệu', emoji: '📦', filter: (item) => !!MATERIALS[item.itemId] },
  { name: 'Vũ Khí', emoji: '⚔️', filter: (item) => { const i = ITEMS[item.itemId]; return i?.type === 'weapon'; } },
  { name: 'Giáp', emoji: '🛡️', filter: (item) => { const i = ITEMS[item.itemId]; return i?.type === 'armor'; } },
  { name: 'Phụ Kiện', emoji: '💍', filter: (item) => { const i = ITEMS[item.itemId]; return i?.type === 'accessory' || i?.type === 'potion'; } },
];

function getItemInfo(itemId: string): { name: string; emoji: string; rarity: ItemRarity; type: string } | null {
  if (ITEMS[itemId]) {
    const item = ITEMS[itemId];
    return { name: item.name, emoji: item.emoji, rarity: item.rarity, type: item.type };
  }
  if (MATERIALS[itemId]) {
    const mat = MATERIALS[itemId];
    return { name: mat.name, emoji: mat.emoji, rarity: mat.rarity, type: 'material' };
  }
  return null;
}

function buildPageEmbed(player: any, page: number): EmbedBuilder {
  const p = PAGES[page];
  const items = player.inventory.items.filter((i: any) => p.filter(i));

  const equippedCount = [player.inventory.equipped.weapon, player.inventory.equipped.armor, player.inventory.equipped.accessory].filter(Boolean).length;

  const embed = new EmbedBuilder()
    .setTitle(`${p.emoji} ${p.name}`)
    .setDescription(`📦 ${player.inventory.items.length}/${player.inventory.maxSlots} | 💰 ${player.stats.gold} Gold | 👔 Đang mang: ${equippedCount}/3`)
    .setColor(0xFFD700);

  if (items.length === 0) {
    embed.setDescription(`${embed.data.description}\n\n*Không có vật phẩm nào.*`);
    return embed;
  }

  const lines = items.map((i: any) => {
    const info = getItemInfo(i.itemId);
    if (!info) return `❓ ${i.itemId} x${i.quantity}`;
    const rarityEmoji = RARITY_EMOJI[info.rarity];
    return `${rarityEmoji} ${info.emoji} **${info.name}** x${i.quantity} | \`${i.itemId}\``;
  });

  // Split into fields of 1024 chars each
  let field = '';
  let fieldNum = 1;
  for (const line of lines) {
    if ((field + '\n' + line).length > 1024) {
      embed.addFields({ name: fieldNum === 1 ? 'Danh sách:' : ` `, value: field, inline: false });
      field = line;
      fieldNum++;
    } else {
      field = field ? field + '\n' + line : line;
    }
  }
  if (field) {
    embed.addFields({ name: fieldNum === 1 ? 'Danh sách:' : ` `, value: field, inline: false });
  }

  return embed;
}

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

    const action = args[0]?.toLowerCase();

    if (action === 'equip' || action === 'wearing' || action === 'mang') {
      const equipped = player.inventory.equipped;
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

    if (player.inventory.items.length === 0) {
      return message.reply('📦 Hành trang trống! Đánh quái để nhặt đồ.');
    }

    let currentPage = 0;

    const embed = buildPageEmbed(player, currentPage);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('inv_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId('inv_page').setLabel(`${PAGES[currentPage].emoji} ${PAGES[currentPage].name}`).setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId('inv_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= PAGES.length - 1),
    );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', async (i: any) => {
      if (i.user.id !== userId) {
        return i.reply({ content: '❌ Không phải menu của bạn!', ephemeral: true });
      }

      if (i.customId === 'inv_prev' && currentPage > 0) {
        currentPage--;
      } else if (i.customId === 'inv_next' && currentPage < PAGES.length - 1) {
        currentPage++;
      }

      const newEmbed = buildPageEmbed(player, currentPage);
      const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('inv_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId('inv_page').setLabel(`${PAGES[currentPage].emoji} ${PAGES[currentPage].name}`).setStyle(ButtonStyle.Primary).setDisabled(true),
        new ButtonBuilder().setCustomId('inv_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= PAGES.length - 1),
      );

      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', async () => {
      try {
        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('inv_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
          new ButtonBuilder().setCustomId('inv_page').setLabel(`${PAGES[currentPage].emoji} ${PAGES[currentPage].name}`).setStyle(ButtonStyle.Primary).setDisabled(true),
          new ButtonBuilder().setCustomId('inv_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        );
        await reply.edit({ components: [disabledRow] });
      } catch {}
    });
  }
};
