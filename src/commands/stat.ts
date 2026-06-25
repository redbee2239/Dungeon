import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

const STAT_COST = 1;

const STAT_INFO: Record<string, { name: string; emoji: string; base: number }> = {
  hp: { name: 'HP', emoji: '❤️', base: 20 },
  mp: { name: 'MP', emoji: '💧', base: 10 },
  attack: { name: 'ATK', emoji: '⚔️', base: 4 },
  defense: { name: 'DEF', emoji: '🛡️', base: 3 },
  speed: { name: 'SPD', emoji: '💨', base: 2 }
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
              ',stat hp - Nâng HP (+10)',
              ',stat mp - Nâng MP (+5)',
              ',stat attack - Nâng ATK (+2)',
              ',stat defense - Nâng DEF (+1)',
              ',stat speed - Nâng SPD (+1)',
              '',
              'Alias: ,stat str/int/vit/agi'
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

    if (player.skillPoints < STAT_COST) {
      return message.reply(`❌ Không đủ Skill Points! Cần **${STAT_COST}** (Bạn có **${player.skillPoints}**)`);
    }

    const info = STAT_INFO[stat];
    if (!info) {
      return message.reply('❌ Chỉ số không hợp lệ!');
    }

    player.skillPoints -= STAT_COST;

    switch (stat) {
      case 'hp':
        player.stats.maxHP += info.base;
        player.stats.hp += info.base;
        break;
      case 'mp':
        player.stats.maxMP += info.base;
        player.stats.mp += info.base;
        break;
      case 'attack':
        player.stats.attack += info.base;
        break;
      case 'defense':
        player.stats.defense += info.base;
        break;
      case 'speed':
        player.stats.speed += info.base;
        break;
    }

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('✅ Nâng Chỉ Số Thành Công!')
      .setDescription(
        `${info.emoji} **${info.name}** +${info.base}\n\n` +
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
