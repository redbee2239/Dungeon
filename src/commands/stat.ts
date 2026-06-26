import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

const STAT_COST = 1;

const STAT_INFO: Record<string, { name: string; emoji: string; base: number }> = {
  hp: { name: 'HP', emoji: '❤️', base: 10 },
  mp: { name: 'MP', emoji: '💧', base: 5 },
  attack: { name: 'ATK', emoji: '⚔️', base: 2 },
  defense: { name: 'DEF', emoji: '🛡️', base: 1 },
  speed: { name: 'SPD', emoji: '💨', base: 1 }
};

export const prefixCommand = {
  name: 'stat',
  description: 'Nâng chỉ số nhân vật',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['hp', 'mp', 'attack', 'defense', 'speed', 'str', 'dex', 'int', 'vit', 'agi'].includes(action)) {
      const embed = new EmbedBuilder()
        .setTitle('📊 Bảng Chỉ Số')
        .setDescription(`⭐ Skill Points: **${player.skillPoints}**\n💡 Mỗi lần nâng: **${STAT_COST}** Skill Point`)
        .addFields(
          {
            name: '📈 Chỉ Số Hiện Tại',
            value: [
              `❤️ HP Tối Đa: **${player.stats.maxHP}**`,
              `💧 MP Tối Đa: **${player.stats.maxMP}**`,
              `⚔️ ATK: **${player.stats.attack}**`,
              `🛡️ DEF: **${player.stats.defense}**`,
              `💨 SPD: **${player.stats.speed}**`
            ].join('\n')
          },
          {
            name: '🎯 Cách Nâng',
            value: [
              ',stat atk - Nâng ATK (+2)',
              ',stat hp - Nâng HP (+10)',
              ',stat mp - Nâng MP (+5)',
              ',stat def - Nâng DEF (+1)',
              ',stat spd - Nâng SPD (+1)',
              '',
              '**Khi nâng 1 stat, tất cả stat khác cũng +1**',
              ',stat atk 3 - Nâng ATK +6, các stat khác +1'
            ].join('\n')
          }
        )
        .setColor(0x00FF00);

      return message.reply({ embeds: [embed] });
    }

    const statMap: Record<string, string> = {
      str: 'attack',
      int: 'mp',
      vit: 'hp',
      agi: 'speed'
    };
    const stat = statMap[action] || action;
    const points = parseInt(args[1]) || 1;

    if (points < 1 || points > 100) {
      return message.reply('❌ Số điểm phải từ 1 đến 100!');
    }

    const totalCost = points * STAT_COST;
    if (player.skillPoints < totalCost) {
      return message.reply(`❌ Không đủ Skill Points! Cần **${totalCost}** (Bạn có **${player.skillPoints}**)`);
    }

    const info = STAT_INFO[stat];
    if (!info) {
      return message.reply('❌ Chỉ số không hợp lệ!');
    }

    player.skillPoints -= totalCost;

    const otherStats = Object.keys(STAT_INFO).filter(s => s !== stat);

    switch (stat) {
      case 'hp':
        player.stats.maxHP += info.base * points;
        player.stats.hp += info.base * points;
        break;
      case 'mp':
        player.stats.maxMP += info.base * points;
        player.stats.mp += info.base * points;
        break;
      case 'attack':
        player.stats.attack += info.base * points;
        break;
      case 'defense':
        player.stats.defense += info.base * points;
        break;
      case 'speed':
        player.stats.speed += info.base * points;
        break;
    }

    for (const other of otherStats) {
      const otherInfo = STAT_INFO[other];
      switch (other) {
        case 'hp':
          player.stats.maxHP += otherInfo.base;
          player.stats.hp += otherInfo.base;
          break;
        case 'mp':
          player.stats.maxMP += otherInfo.base;
          player.stats.mp += otherInfo.base;
          break;
        case 'attack':
          player.stats.attack += otherInfo.base;
          break;
        case 'defense':
          player.stats.defense += otherInfo.base;
          break;
        case 'speed':
          player.stats.speed += otherInfo.base;
          break;
      }
    }

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('✅ Nâng Chỉ Số Thành Công!')
      .setDescription(
        `${info.emoji} **${info.name}** +${info.base * points}\n` +
        `📊 Tất cả stat khác +1\n\n` +
        `📊 Chỉ số mới:\n` +
        `❤️ HP: ${player.stats.hp}/${player.stats.maxHP}\n` +
        `💧 MP: ${player.stats.mp}/${player.stats.maxMP}\n` +
        `⚔️ ATK: ${player.stats.attack}\n` +
        `🛡️ DEF: ${player.stats.defense}\n` +
        `💨 SPD: ${player.stats.speed}`
      )
      .setColor(0x00FF00)
      .setFooter({ text: `Skill Points còn lại: ${player.skillPoints}` });

    message.reply({ embeds: [embed] });
  }
};
