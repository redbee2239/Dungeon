import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

export const prefixCommand = {
  name: 'event',
  aliases: ['suKien', 'events'],
  description: 'Sự kiện Mùa Hè',
  execute: async (message: any, args: string[], db: Database) => {
    const sub = args[0]?.toLowerCase();
    const subArgs = args.slice(1);

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
        progressDesc += `${emoji} Day ${i}: 💰${reward.gold} 💎${reward.gems}\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle('🎉 Mùa Hè Bùng Nổ - Đăng Nhập')
        .setDescription(result.message)
        .addFields({ name: '📊 Tiến Trình', value: progressDesc, inline: false })
        .setColor(0xFFD700)
        .setFooter({ text: `Còn ${daysLeft} ngày | Event Day ${Math.min(eventDay, 15)}/15` });

      return message.reply({ embeds: [embed] });
    }

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
        const bet = parseInt(subArgs[1]) || 100;
        if (bet < 10) return message.reply('❌ Tối thiểu 10 Gold!');
        if (bet > player.stats.gold) return message.reply(`❌ Không đủ Gold! Bạn có ${player.stats.gold}.`);
        const result = playCoinFlip(bet);
        await db.addGold(player, result.goldWon!);
        await db.updatePlayer(player);
        const embed = new EmbedBuilder().setTitle('🪙 Coin Flip').setDescription(result.message).setColor(result.success ? 0x00FF00 : 0xFF0000).setFooter({ text: `Gold: ${player.stats.gold}` });
        return message.reply({ embeds: [embed] });
      }

      if (game === 'dice') {
        const guess = parseInt(subArgs[1]);
        const bet = parseInt(subArgs[2]) || 100;
        if (!guess || guess < 1 || guess > 6) return message.reply('❌ Đoán 1-6! Ví dụ: `,event minigame dice 3 100`');
        if (bet < 10) return message.reply('❌ Tối thiểu 10 Gold!');
        if (bet > player.stats.gold) return message.reply(`❌ Không đủ Gold!`);
        const result = playDiceGuess(guess, bet);
        await db.addGold(player, result.goldWon!);
        await db.updatePlayer(player);
        const embed = new EmbedBuilder().setTitle('🎲 Dice').setDescription(result.message).setColor(result.success ? 0x00FF00 : 0xFF0000).setFooter({ text: `Gold: ${player.stats.gold}` });
        return message.reply({ embeds: [embed] });
      }

      if (game === 'rps') {
        const choice = subArgs[1]?.toLowerCase();
        const bet = parseInt(subArgs[2]) || 100;
        if (!['rock', 'paper', 'scissors'].includes(choice)) return message.reply('❌ Chọn rock, paper hoặc scissors!');
        if (bet < 10) return message.reply('❌ Tối thiểu 10 Gold!');
        if (bet > player.stats.gold) return message.reply(`❌ Không đủ Gold!`);
        const result = playRPS(choice as 'rock' | 'paper' | 'scissors', bet);
        await db.addGold(player, result.goldWon!);
        await db.updatePlayer(player);
        const embed = new EmbedBuilder().setTitle('✊ Rock Paper Scissors').setDescription(result.message).setColor(result.success ? 0x00FF00 : 0xFF0000).setFooter({ text: `Gold: ${player.stats.gold}` });
        return message.reply({ embeds: [embed] });
      }

      return message.reply('❌ Game không hợp lệ!');
    }

    if (sub === 'code') {
      const codeId = subArgs[0]?.toLowerCase();
      const { addItem } = await import('../game/inventory');
      const { ITEMS } = await import('../game/items');

      const CODES: Record<string, { gold: number; gems: number; items?: { id: string; qty: number }[]; once?: boolean }> = {
        summerevent: {
          gold: 1000, gems: 200,
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
        .setDescription(`✅ Mã **${codeId}** đã được sử dụng!\n\n💰 +${codeData.gold} Gold\n💎 +${codeData.gems} Gem${itemMsg}`)
        .setColor(0x00FF00);
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 Sự Kiện Mùa Hè Bùng Nổ')
      .setDescription('Danh sách lệnh sự kiện:')
      .addFields(
        { name: '📅 Đăng Nhập', value: ',`event login` - Nhận quà mỗi ngày', inline: false },
        { name: '🎮 Mini Game', value: ',`event minigame` - Chơi game nhận thưởng', inline: false },
        { name: '🎁 Gift Code', value: ',`event code <mã>` - Nhập mã quà tặng', inline: false },
      )
      .setColor(0xFFD700);

    message.reply({ embeds: [embed] });
  }
};
