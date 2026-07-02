import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Database } from '../game/database';
import { isEventActive, playCoinFlip, playDiceGuess, playRPS } from '../game/summerEvent';

export const prefixCommand = {
  name: 'minigame',
  aliases: ['mg', 'game'],
  description: 'Chơi mini game sự kiện Mùa Hè',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    if (!isEventActive()) {
      return message.reply('❌ Sự kiện Mùa Hè đã kết thúc!');
    }

    const game = args[0]?.toLowerCase();
    const bet = parseInt(args[1]) || 100;

    if (bet < 10) return message.reply('❌ Tối thiểu cược 10 Gold!');
    if (bet > player.stats.gold) return message.reply(`❌ Không đủ Gold! Bạn có ${player.stats.gold} Gold.`);

    if (!game) {
      const embed = new EmbedBuilder()
        .setTitle('🎮 Mini Game - Mùa Hè')
        .setDescription('Chọn game để chơi:')
        .addFields(
          { name: '🪙 Coin Flip', value: `,minigame coin <số tiền>\nTrúng x2, mất x0`, inline: true },
          { name: '🎲 Dice', value: `,minigame dice <số> <số tiền>\nTrúng x5, mất x0\n(Đoán 1-6)`, inline: true },
          { name: '✊ Rock Paper Scissors', value: `,minigame rps <rock|paper|scissors> <số tiền>\nThắng x2, hòa x1, thua x0`, inline: true }
        )
        .setColor(0xFFD700);
      return message.reply({ embeds: [embed] });
    }

    if (game === 'coin') {
      const result = playCoinFlip(bet);
      if (result.success) {
        await db.addGold(player, result.goldWon!);
      } else {
        await db.addGold(player, result.goldWon!);
      }
      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('🪙 Coin Flip')
        .setDescription(result.message)
        .setColor(result.success ? 0x00FF00 : 0xFF0000)
        .setFooter({ text: `Gold còn lại: ${player.stats.gold}` });

      message.reply({ embeds: [embed] });
    }

    if (game === 'dice') {
      const guess = parseInt(args[1]);
      const diceBet = parseInt(args[2]) || 100;

      if (!guess || guess < 1 || guess > 6) {
        return message.reply('❌ Đoán số từ 1-6! Ví dụ: `,minigame dice 3 100`');
      }

      if (diceBet < 10) return message.reply('❌ Tối thiểu cược 10 Gold!');
      if (diceBet > player.stats.gold) return message.reply(`❌ Không đủ Gold! Bạn có ${player.stats.gold} Gold.`);

      const result = playDiceGuess(guess, diceBet);
      if (result.success) {
        await db.addGold(player, result.goldWon!);
      } else {
        await db.addGold(player, result.goldWon!);
      }
      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('🎲 Dice')
        .setDescription(result.message)
        .setColor(result.success ? 0x00FF00 : 0xFF0000)
        .setFooter({ text: `Gold còn lại: ${player.stats.gold}` });

      message.reply({ embeds: [embed] });
    }

    if (game === 'rps') {
      const choice = args[1]?.toLowerCase();
      const rpsBet = parseInt(args[2]) || 100;

      if (!['rock', 'paper', 'scissors'].includes(choice)) {
        return message.reply('❌ Chọn rock, paper hoặc scissors! Ví dụ: `,minigame rps rock 100`');
      }

      if (rpsBet < 10) return message.reply('❌ Tối thiểu cược 10 Gold!');
      if (rpsBet > player.stats.gold) return message.reply(`❌ Không đủ Gold! Bạn có ${player.stats.gold} Gold.`);

      const result = playRPS(choice as 'rock' | 'paper' | 'scissors', rpsBet);
      if (result.goldWon! > 0) {
        await db.addGold(player, result.goldWon!);
      } else if (result.goldWon! < 0) {
        await db.addGold(player, result.goldWon!);
      }
      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('✊ Rock Paper Scissors')
        .setDescription(result.message)
        .setColor(result.success ? 0x00FF00 : 0xFF0000)
        .setFooter({ text: `Gold còn lại: ${player.stats.gold}` });

      message.reply({ embeds: [embed] });
    }
  }
};
