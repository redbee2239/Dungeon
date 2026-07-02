import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { addItem } from '../game/inventory';
import { ITEMS, RARITY_COLORS, RARITY_NAMES } from '../game/items';

const SUMMER_SHOP_ITEMS = [
  { id: 'summer_blade', name: 'Kiếm Mùa Hè', emoji: '☀️', price: 3500, description: 'ATK 52 + HP 40 + SPD 10' },
  { id: 'summer_staff', name: 'Gậy Mùa Hè', emoji: '🌊', price: 3500, description: 'ATK 42 + MP 160 + SPD 8' },
  { id: 'summer_bow', name: 'Cung Mùa Hè', emoji: '🌺', price: 3150, description: 'ATK 45 + SPD 18 + HP 20' },
  { id: 'summer_dagger', name: 'Dao Mùa Hè', emoji: '🐚', price: 3150, description: 'ATK 48 + SPD 20 + HP 15' },
  { id: 'summer_hammer', name: 'Búa Mùa Hè', emoji: '🦀', price: 3850, description: 'ATK 55 + HP 50 + DEF 8' },
  { id: 'summer_ring', name: 'Nhẫn Mùa Hè', emoji: '🐚', price: 2800, description: 'All stats +10~12' },
  { id: 'health_potion', name: 'Health Potion', emoji: '❤️', price: 50, description: '+100 HP', repeatable: true },
  { id: 'mana_potion', name: 'Mana Potion', emoji: '💧', price: 50, description: '+80 MP', repeatable: true },
  { id: 'mega_health', name: 'Mega Health', emoji: '💖', price: 150, description: '+300 HP', repeatable: true },
  { id: 'mana_mega', name: 'Mana Mega', emoji: '🔵', price: 150, description: '+250 MP', repeatable: true },
  { id: 'elixir', name: 'Elixir', emoji: '🧪', price: 400, description: '+200 HP +100 MP', repeatable: true },
  { id: 'exp_boost_potion', name: 'EXP Boost', emoji: '📘', price: 200, description: 'x2 EXP 3 lượt', repeatable: true },
];

export const prefixCommand = {
  name: 'event',
  aliases: ['suKien', 'events'],
  description: 'Sự kiện Mùa Hè',
  execute: async (message: any, args: string[], db: Database) => {
    const sub = args[0]?.toLowerCase();
    const subArgs = args.slice(1);

    // === EVENT LOGIN ===
    if (sub === 'login' || sub === 'dangnhap' || sub === 'daily' || sub === 'dl') {
      const { claimDailyLogin, isEventActive, getDaysRemaining, getEventDay, DAILY_LOGIN_REWARDS } = await import('../game/summerEvent');
      const userId = message.author.id;
      const player = await db.getPlayer(userId);

      if (!player) return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
      if (!isEventActive()) return message.reply('❌ Sự kiện Mùa Hè đã kết thúc!');

      const result = await claimDailyLogin(db, player);
      if (!result.success) return message.reply(result.message);

      const eventDay = getEventDay();
      const daysLeft = getDaysRemaining();

      let progressDesc = '';
      for (let i = 1; i <= 15; i++) {
        const done = i < (player.summerEvent?.consecutiveDays || 0) + 1;
        const current = i === (player.summerEvent?.consecutiveDays || 0) + 1;
        const emoji = done ? '✅' : current ? '📍' : '⬜';
        const reward = DAILY_LOGIN_REWARDS[i - 1];
        progressDesc += `${emoji} Day ${i}: 💰${reward.gold} 💎${reward.gems}`;
        if (reward.items) progressDesc += ` 🎁`;
        progressDesc += '\n';
      }

      const embed = new EmbedBuilder()
        .setTitle('🎉 Mùa Hè Bùng Nổ - Đăng Nhập')
        .setDescription(result.message)
        .addFields({ name: '📊 Tiến Trình', value: progressDesc, inline: false })
        .setColor(0xFFD700)
        .setFooter({ text: `Còn ${daysLeft} ngày | Event Day ${Math.min(eventDay, 15)}/15` });

      return message.reply({ embeds: [embed] });
    }

    // === EVENT MINIGAME ===
    if (sub === 'minigame' || sub === 'mg' || sub === 'game') {
      const { isEventActive, playCoinFlip, playDiceGuess, playRPS } = await import('../game/summerEvent');
      const userId = message.author.id;
      const player = await db.getPlayer(userId);

      if (!player) return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
      if (!isEventActive()) return message.reply('❌ Sự kiện Mùa Hè đã kết thúc!');

      const game = subArgs[0]?.toLowerCase();

      if (!game) {
        const embed = new EmbedBuilder()
          .setTitle('🎮 Mini Game - Mùa Hè')
          .setDescription('Chọn game:\n,`event minigame coin <tiền>`\n,`event minigame dice <số 1-6> <tiền>`\n,`event minigame rps <rock|paper|scissors> <tiền>`')
          .setColor(0xFFD700);
        return message.reply({ embeds: [embed] });
      }

      if (game === 'coin') {
        const bet = parseInt(subArgs[1]) || 10;
        if (bet < 1) return message.reply('❌ Tối thiểu 1 Summer Coin!');
        if ((player.summerCoins || 0) < bet) return message.reply(`❌ Không đủ Summer Coin! Bạn có ${player.summerCoins || 0}.`);
        const result = playCoinFlip(bet);
        player.summerCoins = (player.summerCoins || 0) + result.goldWon!;
        await db.updatePlayer(player);
        const embed = new EmbedBuilder().setTitle('🪙 Coin Flip').setDescription(result.message).setColor(result.success ? 0x00FF00 : 0xFF0000).setFooter({ text: `Summer Coin: ${player.summerCoins}` });
        return message.reply({ embeds: [embed] });
      }

      if (game === 'dice') {
        const guess = parseInt(subArgs[1]);
        const bet = parseInt(subArgs[2]) || 10;
        if (!guess || guess < 1 || guess > 6) return message.reply('❌ Đoán 1-6! Ví dụ: `,event minigame dice 3 10`');
        if (bet < 1) return message.reply('❌ Tối thiểu 1 Summer Coin!');
        if ((player.summerCoins || 0) < bet) return message.reply(`❌ Không đủ Summer Coin!`);
        const result = playDiceGuess(guess, bet);
        player.summerCoins = (player.summerCoins || 0) + result.goldWon!;
        await db.updatePlayer(player);
        const embed = new EmbedBuilder().setTitle('🎲 Dice').setDescription(result.message).setColor(result.success ? 0x00FF00 : 0xFF0000).setFooter({ text: `Summer Coin: ${player.summerCoins}` });
        return message.reply({ embeds: [embed] });
      }

      if (game === 'rps') {
        const choice = subArgs[1]?.toLowerCase();
        const bet = parseInt(subArgs[2]) || 10;
        if (!['rock', 'paper', 'scissors'].includes(choice)) return message.reply('❌ Chọn rock, paper hoặc scissors!');
        if (bet < 1) return message.reply('❌ Tối thiểu 1 Summer Coin!');
        if ((player.summerCoins || 0) < bet) return message.reply(`❌ Không đủ Summer Coin!`);
        const result = playRPS(choice as 'rock' | 'paper' | 'scissors', bet);
        player.summerCoins = (player.summerCoins || 0) + result.goldWon!;
        await db.updatePlayer(player);
        const embed = new EmbedBuilder().setTitle('✊ Rock Paper Scissors').setDescription(result.message).setColor(result.success ? 0x00FF00 : 0xFF0000).setFooter({ text: `Summer Coin: ${player.summerCoins}` });
        return message.reply({ embeds: [embed] });
      }

      return message.reply('❌ Game không hợp lệ!');
    }

    // === EVENT SHOP ===
    if (sub === 'shop' || sub === 'cuaahang' || sub === 'mua') {
      const { isEventActive } = await import('../game/summerEvent');
      const userId = message.author.id;
      const player = await db.getPlayer(userId);

      if (!player) return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
      if (!isEventActive()) return message.reply('❌ Sự kiện Mùa Hè đã kết thúc!');

      const buyId = subArgs[0]?.toLowerCase();

      if (buyId) {
        const shopItem = SUMMER_SHOP_ITEMS.find(i => i.id === buyId);
        if (!shopItem) return message.reply('❌ Vật phẩm không tồn tại! Dùng `,event shop` để xem danh sách.');

        if (!shopItem.repeatable) {
          const owned = player.inventory.items.find((i: any) => i.itemId === buyId);
          if (owned) return message.reply('❌ Bạn đã sở hữu vật phẩm này rồi!');
        }

        if ((player.summerCoins || 0) < shopItem.price) {
          return message.reply(`❌ Không đủ Summer Coin! Cần ${shopItem.price}, bạn có ${player.summerCoins || 0}.`);
        }

        const itemData = ITEMS[buyId];
        if (!itemData) return message.reply('❌ Lỗi vật phẩm!');

        player.summerCoins -= shopItem.price;
        addItem(player.inventory, itemData, 1);
        await db.updatePlayer(player);

        const embed = new EmbedBuilder()
          .setTitle('🛒 Mua Thành Công!')
          .setDescription(`${shopItem.emoji} **${shopItem.name}**\n${shopItem.description}\n\n🪙 -${shopItem.price} Summer Coin\n💰 Còn lại: ${player.summerCoins || 0}`)
          .setColor(0x00FF00);
        return message.reply({ embeds: [embed] });
      }

      let shopList = '';
      for (const item of SUMMER_SHOP_ITEMS) {
        const owned = player.inventory.items.find((i: any) => i.itemId === item.id);
        const status = !item.repeatable && owned ? '✅ Đã mua' : `🪙 ${item.price} Summer Coin`;
        shopList += `${item.emoji} **${item.name}** - ${item.description}\n   ${status}\n\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle('🛒 Event Shop - Mùa Hè')
        .setDescription(shopList)
        .addFields({ name: '🪙 Summer Coin của bạn', value: `${player.summerCoins || 0}`, inline: true })
        .setFooter({ text: 'Dùng ,event shop <id> để mua' })
        .setColor(0xFFD700);

      return message.reply({ embeds: [embed] });
    }

    // === EVENT CODE ===
    if (sub === 'code') {
      const codeId = subArgs[0]?.toLowerCase();

      const CODES: Record<string, { gold: number; gems: number; summerCoins: number; items?: { id: string; qty: number }[]; once?: boolean }> = {
        summerevent: {
          gold: 1000, gems: 200, summerCoins: 50,
          items: [{ id: 'health_potion', qty: 5 }, { id: 'mana_potion', qty: 3 }],
          once: true,
        },
      };

      const userId = message.author.id;
      const player = await db.getPlayer(userId);
      if (!player) return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
      if (!codeId) return message.reply('❌ Dùng: `,event code <mã>`');

      const codeData = CODES[codeId];
      if (!codeData) return message.reply('❌ Mã code không hợp lệ!');

      if (!player.summerEvent) {
        player.summerEvent = { consecutiveDays: 0, lastDailyLogin: 0, claimedCode: false, minigameLastPlay: 0, minigameWins: 0 };
      }

      if (codeData.once && codeId === 'summerevent' && player.summerEvent.claimedCode) {
        return message.reply('❌ Bạn đã sử dụng code này rồi!');
      }

      await db.addGold(player, codeData.gold);
      await db.addGems(player, codeData.gems);
      player.summerCoins = (player.summerCoins || 0) + codeData.summerCoins;

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

      if (codeId === 'summerevent') player.summerEvent.claimedCode = true;
      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('🎁 Gift Code')
        .setDescription(
          `✅ Mã **${codeId}** đã được sử dụng!\n\n` +
          `💰 +${codeData.gold} Gold\n💎 +${codeData.gems} Gem\n🪙 +${codeData.summerCoins} Summer Coin` +
          itemMsg
        )
        .setColor(0x00FF00);
      return message.reply({ embeds: [embed] });
    }

    // === EVENT MENU ===
    const embed = new EmbedBuilder()
      .setTitle('🎉 Sự Kiện Mùa Hè Bùng Nổ')
      .setDescription('Danh sách lệnh sự kiện:')
      .addFields(
        { name: '📅 Đăng Nhập', value: ',`event login` - Nhận quà mỗi ngày', inline: false },
        { name: '🎮 Mini Game', value: ',`event minigame` - Chơi game nhận thưởng', inline: false },
        { name: '🛒 Shop', value: ',`event shop` - Mua vật phẩm Limited', inline: false },
        { name: '🎁 Gift Code', value: ',`event code <mã>` - Nhập mã quà tặng', inline: false },
      )
      .setColor(0xFFD700);

    message.reply({ embeds: [embed] });
  }
};
