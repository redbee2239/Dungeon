import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, RARITY_NAMES, RARITY_COLORS, Item, ItemType, ItemRarity } from '../game/items';
import { addItem } from '../game/inventory';

const shopItems: Item[] = [
  ITEMS.wooden_sword, ITEMS.iron_sword, ITEMS.steel_sword,
  ITEMS.bronze_axe, ITEMS.silver_blade, ITEMS.battle_axe,
  ITEMS.magic_wand, ITEMS.oak_staff, ITEMS.arcane_rod, ITEMS.crystal_staff,
  ITEMS.short_bow, ITEMS.hunting_bow, ITEMS.long_bow,
  ITEMS.basic_staff, ITEMS.wolf_staff,
  ITEMS.cloth_armor, ITEMS.leather_armor, ITEMS.chain_vest,
  ITEMS.chain_mail, ITEMS.knight_armor, ITEMS.mage_robe,
  ITEMS.iron_ring, ITEMS.speed_ring, ITEMS.power_amulet,
  ITEMS.attack_ring, ITEMS.defense_ring, ITEMS.lucky_charm,
  ITEMS.health_potion, ITEMS.mega_health, ITEMS.mana_potion, ITEMS.mana_mega, ITEMS.elixir,
  ITEMS.str_potion, ITEMS.def_potion, ITEMS.spd_potion, ITEMS.hp_potion,
  ITEMS.berserk_potion, ITEMS.iron_skin, ITEMS.mega_str, ITEMS.mega_def,
  ITEMS.exp_boost_potion
];

const CATEGORIES = [
  { id: 'weapon', label: '⚔️ Vũ Khí', types: ['weapon'] as ItemType[], color: 0xE74C3C },
  { id: 'armor', label: '🛡️ Giáp', types: ['armor'] as ItemType[], color: 0x3498DB },
  { id: 'accessory', label: '💍 Phụ Kiện', types: ['accessory'] as ItemType[], color: 0xF1C40F },
  { id: 'potion', label: '🧪 Thuốc', types: ['potion'] as ItemType[], color: 0x2ECC71 }
];

const RARITY_ORDER: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function getItemsByCategory(categoryId: string): Item[] {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return [];
  return shopItems.filter(item => cat.types.includes(item.type));
}

function formatItemStats(item: Item): string {
  if (!item.stats) return '';
  const parts: string[] = [];
  if (item.stats.attack) parts.push(`⚔️ ATK +${item.stats.attack}`);
  if (item.stats.defense) parts.push(`🛡️ DEF +${item.stats.defense}`);
  if (item.stats.hp) parts.push(`❤️ HP +${item.stats.hp}`);
  if (item.stats.mp) parts.push(`💧 MP +${item.stats.mp}`);
  if (item.stats.speed) parts.push(`⚡ SPD +${item.stats.speed}`);
  return parts.join(' | ');
}

function buildItemList(items: Item[], playerGold: number): string {
  const grouped: Record<ItemRarity, Item[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [], limited: [] };
  for (const item of items) grouped[item.rarity].push(item);

  let desc = '';
  for (const rarity of RARITY_ORDER) {
    const group = grouped[rarity];
    if (group.length === 0) continue;
    desc += `\n**${RARITY_NAMES[rarity]}**\n`;
    for (const item of group) {
      const canBuy = playerGold >= item.price;
      const check = canBuy ? '✅' : '❌';
      const stats = formatItemStats(item);
      desc += `${check} ${item.emoji} **${item.name}** — 💰${item.price.toLocaleString()}`;
      if (stats) desc += `\n     └ ${stats}`;
      desc += `\n`;
    }
  }
  return desc;
}

export const prefixCommand = {
  name: 'shop',
  description: 'Cửa hàng',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['buy', 'sell', 'mua', 'ban'].includes(action)) {
      const embed = new EmbedBuilder()
        .setTitle('🏪 Cửa Hàng Dungeon')
        .setDescription(
          `**💰 Gold của bạn:** ${player.stats.gold.toLocaleString()}\n` +
          `**💎 Gem của bạn:** ${player.gems.toLocaleString()}\n\n` +
          '`.shop buy` — Mua vật phẩm\n' +
          '`shop sell` — Bán vật phẩm\n\n' +
          '**Chọn loại bên dưới để bắt đầu mua sắm:**'
        )
        .setColor(0xFFD700)
        .setThumbnail('https://img.icons8.com/color/96/shop.png')
        .setFooter({ text: 'Chọn loại vật phẩm bên dưới' });

      const row = new ActionRowBuilder<StringSelectMenuBuilder>();
      row.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('shop_category')
          .setPlaceholder('🛒 Chọn loại vật phẩm...')
          .addOptions(
            CATEGORIES.map(cat => ({
              label: cat.label,
              value: cat.id,
              description: `${getItemsByCategory(cat.id).length} vật phẩm`
            }))
          )
      );

      const reply = await message.reply({ embeds: [embed], components: [row] });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000
      });

      collector.on('collect', async (i: any) => {
        if (i.user.id !== userId) {
          return i.reply({ content: '❌ Đây không phải shop của bạn!', ephemeral: true });
        }

        await i.deferUpdate();
        const categoryId = i.values[0];
        const category = CATEGORIES.find(c => c.id === categoryId);
        if (!category) return;

        const items = getItemsByCategory(categoryId);
        const displayItems = items.slice(0, 25);

        const categoryEmbed = new EmbedBuilder()
          .setTitle(`${category.label}`)
          .setDescription(
            `**💰 Gold:** ${player.stats.gold.toLocaleString()}\n\n` +
            buildItemList(displayItems, player.stats.gold)
          )
          .setColor(category.color)
          .setFooter({ text: 'Chọn vật phẩm muốn mua bên dưới' });

        const buyRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        buyRow.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('shop_buy_item')
            .setPlaceholder('🛒 Chọn vật phẩm muốn mua...')
            .addOptions(
              displayItems.map(item => ({
                label: `${item.emoji} ${item.name}`.substring(0, 100),
                value: item.id,
                description: `💰${item.price.toLocaleString()} Gold | ${RARITY_NAMES[item.rarity]}`.substring(0, 100)
              }))
            )
        );

        const backRow = new ActionRowBuilder<ButtonBuilder>();
        backRow.addComponents(
          new ButtonBuilder().setCustomId('shop_back').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
        );

        await i.message.edit({ embeds: [categoryEmbed], components: [buyRow, backRow] });

        const buyCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000
        });

        buyCollector.on('collect', async (bi: any) => {
          if (bi.user.id !== userId) {
            return bi.reply({ content: '❌ Đây không phải shop của bạn!', ephemeral: true });
          }

          await bi.deferUpdate();
          const selectedItemId = bi.values[0];
          const selectedItem = shopItems.find(item => item.id === selectedItemId);
          if (!selectedItem) return;

          if (player.stats.gold < selectedItem.price) {
            const failEmbed = new EmbedBuilder()
              .setTitle('❌ Không Đủ Gold!')
              .setDescription(
                `Bạn muốn mua: ${selectedItem.emoji} **${selectedItem.name}**\n\n` +
                `💰 Cần: **${selectedItem.price.toLocaleString()}** Gold\n` +
                `💰 Hiện có: **${player.stats.gold.toLocaleString()}** Gold\n` +
                `💰 Thiếu: **${(selectedItem.price - player.stats.gold).toLocaleString()}** Gold`
              )
              .setColor(0xFF0000);
            await bi.message.edit({ embeds: [failEmbed], components: [] });
            buyCollector.stop();
            return;
          }

          const result = addItem(player.inventory, selectedItem);
          if (!result.success) {
            await bi.message.edit({ content: `❌ ${result.message}`, embeds: [], components: [] });
            buyCollector.stop();
            return;
          }

          await db.removeGold(player, selectedItem.price);
          await db.updatePlayer(player);

          const stats = formatItemStats(selectedItem);
          const successEmbed = new EmbedBuilder()
            .setTitle('✅ Mua Thành Công!')
            .setDescription(
              `${selectedItem.emoji} **${selectedItem.name}**\n\n` +
              `${stats ? `📊 ${stats}\n` : ''}` +
              `📜 ${selectedItem.description}\n\n` +
              `💰 Gold còn lại: **${player.stats.gold.toLocaleString()}**`
            )
            .setColor(RARITY_COLORS[selectedItem.rarity])
            .setFooter({ text: `${RARITY_NAMES[selectedItem.rarity]} • Đã thêm vào hành trang` });

          await bi.message.edit({ embeds: [successEmbed], components: [] });
          buyCollector.stop();
        });

        buyCollector.on('end', async (_collected: any, reason: string) => {
          if (reason === 'time') {
            await i.message.edit({ content: '⏰ Hết thời gian mua sắm!', embeds: [], components: [] });
          }
        });
      });

      collector.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          await reply.edit({ content: '⏰ Hết thời gian mua sắm!', embeds: [], components: [] });
        }
      });

    } else {
      if (player.inventory.items.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setTitle('📦 Hành Trang Trống')
          .setDescription('Bạn chưa có vật phẩm nào để bán!')
          .setColor(0x808080);
        return message.reply({ embeds: [emptyEmbed] });
      }

      const itemId = args[1]?.toLowerCase();
      if (itemId) {
        const invItem = player.inventory.items.find((i: any) => i.itemId === itemId);
        if (!invItem) {
          return message.reply('❌ Không tìm thấy vật phẩm trong hành trang!');
        }
        const item = ITEMS[itemId];
        if (!item) {
          return message.reply('❌ Lỗi vật phẩm!');
        }

        const quantity = args[2] ? parseInt(args[2]) : invItem.quantity;
        if (isNaN(quantity) || quantity <= 0) {
          return message.reply('❌ Số lượng không hợp lệ!');
        }
        if (quantity > invItem.quantity) {
          return message.reply(`❌ Không đủ! Bạn có **${invItem.quantity}** ${item.name}.`);
        }

        const gold = item.sellPrice * quantity;
        invItem.quantity -= quantity;
        if (invItem.quantity <= 0) {
          player.inventory.items = player.inventory.items.filter((i: any) => i.quantity > 0);
        }
        await db.addGold(player, gold);
        await db.updatePlayer(player);

        const sellEmbed = new EmbedBuilder()
          .setTitle('💰 Bán Thành Công!')
          .setDescription(
            `${item.emoji} **${item.name}** x${quantity}\n\n` +
            `+💰 **${gold.toLocaleString()}** Gold\n\n` +
            `💰 Gold hiện tại: **${player.stats.gold.toLocaleString()}**`
          )
          .setColor(RARITY_COLORS[item.rarity]);
        return message.reply({ embeds: [sellEmbed] });
      }

      const embed = new EmbedBuilder()
        .setTitle('💰 Bán Vật Phẩm')
        .setDescription(
          `**💰 Gold:** ${player.stats.gold.toLocaleString()}\n\n` +
          `Dùng \`,shop sell <id> [số lượng]\` để bán\n` +
          `Bỏ trống số lượng = bán hết`
        )
        .setColor(0xF39C12);

      const displayItems = player.inventory.items.slice(0, 25);
      for (const i of displayItems) {
        const item = ITEMS[i.itemId];
        if (item) {
          embed.addFields({
            name: `${item.emoji} ${item.name} x${i.quantity}`,
            value: `💰 ${item.sellPrice.toLocaleString()} Gold/ea\nID: \`${item.id}\``,
            inline: true
          });
        }
      }

      message.reply({ embeds: [embed] });
    }
  }
};
