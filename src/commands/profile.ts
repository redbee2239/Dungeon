import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { CLASS_DATA, CharacterClass } from '../game/classes';
import { calculateBonusStats } from '../game/inventory';

const CLASS_COLORS: Record<CharacterClass, number> = {
  warrior: 0xE74C3C,
  mage: 0x3498DB,
  rogue: 0x9B59B6,
  cleric: 0xF1C40F,
  gladiator: 0xE67E22,
  summoner: 0x1ABC9C,
  archer: 0x2ECC71,
  necromancer: 0x8E44AD
};

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
    const bonus = calculateBonusStats(player.inventory, player.equippedPet);
    const totalAttack = player.stats.attack + bonus.attack;
    const totalDefense = player.stats.defense + bonus.defense;
    const totalHP = player.stats.maxHP + bonus.hp;
    const totalMP = player.stats.maxMP + bonus.mp;

    const expPercent = ((player.stats.exp / player.stats.expToNext) * 100).toFixed(1);
    const hpPercent = ((player.stats.hp / totalHP) * 100).toFixed(0);
    const mpPercent = ((player.stats.mp / totalMP) * 100).toFixed(0);

    const hpBar = generateProgressBar(player.stats.hp, totalHP, 10);
    const mpBar = generateProgressBar(player.stats.mp, totalMP, 10);
    const expBar = generateProgressBar(player.stats.exp, player.stats.expToNext, 15);

    const embed = new EmbedBuilder()
      .setTitle(`${cls.emoji} ${player.name}`)
      .setDescription(
        `**Class:** ${cls.name} | **Level:** ${player.stats.level}\n` +
        `**ID:** \`${player.id}\``
      )
      .addFields(
        {
          name: '❤️ HP',
          value: `${player.stats.hp}/${totalHP} (${hpPercent}%)\n${hpBar}`,
          inline: true
        },
        {
          name: '💧 MP',
          value: `${player.stats.mp}/${totalMP} (${mpPercent}%)\n${mpBar}`,
          inline: true
        },
        {
          name: '⭐ EXP',
          value: `${player.stats.exp}/${player.stats.expToNext} (${expPercent}%)\n${expBar}`,
          inline: false
        },
        {
          name: '⚔️ Combat',
          value: [
            `⚔️ ATK: **${totalAttack}**`,
            `🛡️ DEF: **${totalDefense}**`,
            `💨 SPD: **${player.stats.speed}**`
          ].join('\n'),
          inline: true
        },
        {
          name: '💰 Resources',
          value: [
            `💰 Gold: **${player.stats.gold.toLocaleString()}**`,
            `💎 Gem: **${player.gems.toLocaleString()}**`,
            `⭐ Skill Points: **${player.skillPoints}**`
          ].join('\n'),
          inline: true
        },
        {
          name: '🏆 Thành Tích',
          value: [
            `Quái đã giết: **${player.totalMonstersKilled}**`,
            `Tầng cao nhất: **${player.highestFloor}**`,
            `Tổng gold: **${player.totalGoldEarned.toLocaleString()}**`
          ].join('\n'),
          inline: true
        }
      )
      .setColor(CLASS_COLORS[player.characterClass] || 0x0099FF)
      .setThumbnail(message.author.displayAvatarURL());

    message.reply({ embeds: [embed] });
  }
};
