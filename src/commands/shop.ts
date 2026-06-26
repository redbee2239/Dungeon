import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, RARITY_NAMES, Item, ItemType } from '../game/items';
import { addItem } from '../game/inventory';

const shopItems: Item[] = [
  // Weapons
  ITEMS.wooden_sword, ITEMS.iron_sword, ITEMS.steel_sword,
  ITEMS.bronze_axe, ITEMS.silver_blade, ITEMS.battle_axe,
  ITEMS.magic_wand, ITEMS.oak_staff, ITEMS.arcane_rod, ITEMS.crystal_staff,
  ITEMS.short_bow, ITEMS.hunting_bow, ITEMS.long_bow,
  ITEMS.basic_staff, ITEMS.wolf_staff,
  // Armor
  ITEMS.cloth_armor, ITEMS.leather_armor, ITEMS.chain_vest,
  ITEMS.chain_mail, ITEMS.knight_armor, ITEMS.mage_robe,
  // Accessories
  ITEMS.iron_ring, ITEMS.speed_ring, ITEMS.power_amulet,
  ITEMS.attack_ring, ITEMS.defense_ring, ITEMS.lucky_charm,
  // Potions
  ITEMS.health_potion, ITEMS.mega_health, ITEMS.mana_potion, ITEMS.mana_mega, ITEMS.elixir,
  ITEMS.str_potion, ITEMS.def_potion, ITEMS.spd_potion, ITEMS.hp_potion,
  ITEMS.berserk_potion, ITEMS.iron_skin, ITEMS.mega_str, ITEMS.mega_def
];

const CATEGORIES = [
  { id: 'weapon', label: '⚔️ Vũ Khí', emoji: '⚔️', types: ['weapon'] as ItemType[] },
  { id: 'armor', label: '🛡️ Giáp', emoji: '🛡️', types: ['armor'] as ItemType[] },
  { id: 'accessory', label: '💍 Phụ Kiện', emoji: '💍', types: ['accessory'] as ItemType[] },
  { id: 'potion', label: '🧪 Thuốc', emoji: '🧪', types: ['potion'] as ItemType[] }
];

function getItemsByCategory(categoryId: string): Item[] {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return [];
  return shopItems.filter(item => cat.types.includes(item.type));
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
        .setTitle('🛒 Cửa Hàng')
        .setDescription('Cách dùng:\n`,shop buy` - Mua đồ\n`,shop sell` - Bán đồ')
        .setColor(0xFFD700);
      return message.reply({ embeds: [embed] });
    }

    if (action === 'buy' || action === 'mua') {
      const itemId = args[1]?.toLowerCase();

      if (itemId) {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) {
          return message.reply('❌ Không tìm thấy vật phẩm! Dùng `,shop buy` để xem danh sách.');
        }
        if (player.stats.gold < item.price) {
          return message.reply(`❌ Không đủ gold! Cần ${item.price} gold.`);
        }
        const result = addItem(player.inventory, item);
        if (!result.success) {
          return message.reply(`❌ ${result.message}`);
        }
        await db.removeGold(player, item.price);
        await db.updatePlayer(player);
        return message.reply(`✅ Mua thành công **${item.name}** (-${item.price} Gold)`);
      }

      const embed = new EmbedBuilder()
        .setTitle('🛒 Mua Đồ')
        .setDescription(`💰 Gold: **${player.stats.gold}**\n\nChọn loại vật phẩm muốn mua:`)
        .setColor(0xFFD700);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>();
      row.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('shop_category')
          .setPlaceholder('Chọn loại...')
          .addOptions(
            CATEGORIES.map(cat => ({
              label: cat.label,
              value: cat.id,
              emoji: cat.emoji,
              description: `Xem ${getItemsByCategory(cat.id).length} vật phẩm`
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
          return i.reply({ content: 'Đây không phải shop của bạn!', ephemeral: true });
        }

        await i.deferUpdate();
        const categoryId = i.values[0];
        const category = CATEGORIES.find(c => c.id === categoryId);
        if (!category) return;

        const items = getItemsByCategory(categoryId);

        const categoryEmbed = new EmbedBuilder()
          .setTitle(`${category.emoji} ${category.label}`)
          .setDescription(`💰 Gold: **${player.stats.gold}**\n\nChọn vật phẩm muốn mua:`)
          .setColor(0xFFD700);

        const displayItems = items.slice(0, 25);
        displayItems.forEach(item => {
          categoryEmbed.addFields({
            name: `${item.emoji} ${item.name}`,
            value: `💰 ${item.price} Gold\n${RARITY_NAMES[item.rarity]}\nID: \`${item.id}\``,
            inline: true
          });
        });

        const buyRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        buyRow.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('shop_buy_item')
            .setPlaceholder('Chọn vật phẩm...')
            .addOptions(
              displayItems.map(item => ({
                label: `${item.name} - ${item.price} Gold`.substring(0, 100),
                value: item.id,
                description: item.description.substring(0, 100)
              }))
            )
        );

        const backRow = new ActionRowBuilder<ButtonBuilder>();
        backRow.addComponents(
          new ButtonBuilder().setCustomId('shop_back').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
        );

        await i.editReply({ embeds: [categoryEmbed], components: [buyRow, backRow] });

        const buyCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000
        });

        buyCollector.on('collect', async (bi: any) => {
          if (bi.user.id !== userId) {
            return bi.reply({ content: 'Đây không phải shop của bạn!', ephemeral: true });
          }

          await bi.deferUpdate();
          const selectedItemId = bi.values[0];
          const selectedItem = shopItems.find(item => item.id === selectedItemId);
          if (!selectedItem) return;

          if (player.stats.gold < selectedItem.price) {
            await bi.editReply({ content: `❌ Không đủ gold! Cần **${selectedItem.price}** gold.`, embeds: [], components: [] });
            buyCollector.stop();
            return;
          }

          const result = addItem(player.inventory, selectedItem);
          if (!result.success) {
            await bi.editReply({ content: `❌ ${result.message}`, embeds: [], components: [] });
            buyCollector.stop();
            return;
          }

          await db.removeGold(player, selectedItem.price);
          await db.updatePlayer(player);

          const successEmbed = new EmbedBuilder()
            .setTitle('✅ Mua Thành Công!')
            .setDescription(`${selectedItem.emoji} **${selectedItem.name}**\n\n💰 Gold còn lại: **${player.stats.gold}**`)
            .setColor(0x00FF00);

          await bi.editReply({ embeds: [successEmbed], components: [] });
          buyCollector.stop();
        });

        buyCollector.on('end', async (_collected: any, reason: string) => {
          if (reason === 'time') {
            await i.editReply({ content: '⏰ Hết thời gian!', embeds: [], components: [] });
          }
        });
      });

      collector.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          await reply.edit({ content: '⏰ Hết thời gian!', embeds: [], components: [] });
        }
      });

    } else {
      if (player.inventory.items.length === 0) {
        return message.reply('📦 Hành trang trống!');
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
        return message.reply(`✅ Bán **${quantity}x ${item.name}** (+${gold} Gold)`);
      }

      const embed = new EmbedBuilder()
        .setTitle('💰 Bán Đồ')
        .setDescription(`Gold: **${player.stats.gold}**\n\nDùng \`,shop sell <id> [số lượng]\` để bán:\nBỏ trống số lượng = bán hết`)
        .setColor(0xFFD700);

      const displayItems = player.inventory.items.slice(0, 25);
      displayItems.forEach((i: any) => {
        const item = ITEMS[i.itemId];
        if (item) {
          embed.addFields({
            name: `${item.emoji} ${item.name} x${i.quantity}`,
            value: `💰 ${item.sellPrice} Gold/ea\nID: \`${item.id}\``,
            inline: true
          });
        }
      });

      message.reply({ embeds: [embed] });
    }
  }
};
