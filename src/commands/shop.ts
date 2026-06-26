import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, RARITY_NAMES, Item } from '../game/items';
import { addItem, sellItem } from '../game/inventory';

const shopItems: Item[] = [
  // Weapons - Physical
  ITEMS.wooden_sword,
  ITEMS.iron_sword,
  ITEMS.steel_sword,
  ITEMS.bronze_axe,
  ITEMS.silver_blade,
  ITEMS.battle_axe,
  // Weapons - Magic
  ITEMS.magic_wand,
  ITEMS.oak_staff,
  ITEMS.arcane_rod,
  ITEMS.crystal_staff,
  // Weapons - Bow
  ITEMS.short_bow,
  ITEMS.hunting_bow,
  ITEMS.long_bow,
  // Weapons - Summoner
  ITEMS.basic_staff,
  ITEMS.wolf_staff,
  // Armor
  ITEMS.cloth_armor,
  ITEMS.leather_armor,
  ITEMS.chain_vest,
  ITEMS.chain_mail,
  ITEMS.knight_armor,
  ITEMS.mage_robe,
  // Accessories
  ITEMS.iron_ring,
  ITEMS.speed_ring,
  ITEMS.power_amulet,
  ITEMS.attack_ring,
  ITEMS.defense_ring,
  ITEMS.lucky_charm,
  // Potions
  ITEMS.health_potion,
  ITEMS.mega_health,
  ITEMS.mana_potion,
  ITEMS.mana_mega,
  ITEMS.elixir,
  // Buff Potions
  ITEMS.str_potion,
  ITEMS.def_potion,
  ITEMS.spd_potion,
  ITEMS.hp_potion,
  ITEMS.berserk_potion,
  ITEMS.iron_skin,
  ITEMS.mega_str,
  ITEMS.mega_def
];

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
        .setDescription(`💰 Gold: **${player.stats.gold}**\n\nDùng \`,shop buy <id>\` để mua:`)
        .setColor(0xFFD700);

      const displayItems = shopItems.slice(0, 25);
      displayItems.forEach(item => {
        embed.addFields({
          name: `${item.emoji} ${item.name}`,
          value: `💰 ${item.price} Gold\n${RARITY_NAMES[item.rarity]}\nID: \`${item.id}\``,
          inline: true
        });
      });

      message.reply({ embeds: [embed] });

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
