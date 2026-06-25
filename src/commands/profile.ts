import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { CLASS_DATA } from '../game/classes';
import { calculateBonusStats } from '../game/inventory';

function generateProgressBar(current: number, max: number, length: number): string {
  const filled = Math.floor((current / max) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export const prefixCommand = {
  name: 'profile',
  description: 'Xem thông tin nhân vật',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const cls = CLASS_DATA[player.characterClass];
    const bonus = calculateBonusStats(player.inventory);
    const totalAttack = player.stats.attack + bonus.attack;
    const totalDefense = player.stats.defense + bonus.defense;
    const totalHP = player.stats.maxHP + bonus.hp;
    const totalMP = player.stats.maxMP + bonus.mp;

    const expPercent = ((player.stats.exp / player.stats.expToNext) * 100).toFixed(1);
    const progressBar = generateProgressBar(player.stats.exp, player.stats.expToNext, 15);

    const embed = new EmbedBuilder()
      .setTitle(`${cls.emoji} ${player.name}`)
      .setDescription(`**Lớp:** ${cls.name} | **Level:** ${player.stats.level}`)
      .addFields(
        {
          name: '📊 Thống Kê',
          value: [
            `❤️ HP: ${player.stats.hp}/${totalHP}`,
            `💧 MP: ${player.stats.mp}/${totalMP}`,
            `⚔️ ATK: ${totalAttack}`,
            `🛡️ DEF: ${totalDefense}`,
            `💨 SPD: ${player.stats.speed}`
          ].join('\n'),
          inline: true
        },
        {
          name: '📈 Tiến Trình',
          value: [
            `EXP: ${player.stats.exp}/${player.stats.expToNext} (${expPercent}%)`,
            `${progressBar}`,
            `💰 Gold: ${player.stats.gold}`,
            `💎 Gem: ${player.gems}`,
            `⭐ Skill Points: ${player.skillPoints}`
          ].join('\n'),
          inline: true
        },
        {
          name: '🏆 Thành Tích',
          value: [
            `Quái đã giết: ${player.totalMonstersKilled}`,
            `Tầng cao nhất: ${player.highestFloor}`,
            `Tổng gold: ${player.totalGoldEarned}`
          ].join('\n')
        }
      )
      .setColor(0x0099FF)
      .setThumbnail(message.author.displayAvatarURL());

    message.reply({ embeds: [embed] });
  }
};
