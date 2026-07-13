import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

import { CLASS_DATA, CharacterClass } from '../game/classes';

const STAT_COST = 1;
const STAT_LIMITS: Record<string, number> = {
  speed: 120
};

const STAT_INFO: Record<string, { name: string; emoji: string; base: number }> = {
  hp: { name: 'HP', emoji: '❤️', base: 10 },
  mp: { name: 'MP', emoji: '💧', base: 5 },
  attack: { name: 'ATK', emoji: '⚔️', base: 2 },
  defense: { name: 'DEF', emoji: '🛡️', base: 1 },
  speed: { name: 'SPD', emoji: '💨', base: 1 }
};

const RESET_COST = 200;

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

    if (action === 'reset') {
      if ((player.statPointsUsed || 0) === 0) {
        return message.reply('❌ Bạn chưa nâng chỉ số nào!');
      }

      if (player.gems < RESET_COST) {
        return message.reply(`❌ Không đủ Gem! Cần **${RESET_COST}** 💎 (Bạn có **${player.gems}** 💎)`);
      }

      const pointsRefund = player.statPointsUsed || 0;
      const cls = CLASS_DATA[player.characterClass as CharacterClass];
      player.gems -= RESET_COST;
      player.skillPoints += pointsRefund;
      player.stats.maxHP = cls.baseHP;
      player.stats.hp = cls.baseHP;
      player.stats.maxMP = cls.baseMP;
      player.stats.mp = cls.baseMP;
      player.stats.attack = cls.baseAttack;
      player.stats.defense = cls.baseDefense;
      player.stats.speed = cls.baseSpeed;
      player.statPointsUsed = 0;

      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('🔄 Reset Chỉ Số Thành Công!')
        .setDescription(
          `**Hoàn lại:** ${pointsRefund} Skill Points\n` +
          `**Chi phí:** ${RESET_COST} 💎\n\n` +
          `**Chỉ số về base:**\n` +
          `❤️ HP: ${cls.baseHP}\n` +
          `💧 MP: ${cls.baseMP}\n` +
          `⚔️ ATK: ${cls.baseAttack}\n` +
          `🛡️ DEF: ${cls.baseDefense}\n` +
          `💨 SPD: ${cls.baseSpeed}`
        )
        .setColor(0xFF6600)
        .setFooter({ text: `Skill Points: ${player.skillPoints} | Gem: ${player.gems}` });

      return message.reply({ embeds: [embed] });
    }

    if (!action || !['hp', 'mp', 'attack', 'defense', 'speed', 'str', 'dex', 'int', 'vit', 'agi', 'atk', 'def', 'spd'].includes(action)) {
      const embed = new EmbedBuilder()
        .setTitle('📊 Bảng Chỉ Số')
        .setDescription(`⭐ Skill Points: **${player.skillPoints}** | Đã dùng: **${player.statPointsUsed || 0}** SP`)
        .addFields(
          {
            name: '📈 Chỉ Số Hiện Tại',
            value: [
              `❤️ HP: **${player.stats.maxHP}**`,
              `💧 MP: **${player.stats.maxMP}**`,
              `⚔️ ATK: **${player.stats.attack}**`,
              `🛡️ DEF: **${player.stats.defense}**`,
              `💨 SPD: **${player.stats.speed}**`
            ].join('\n'),
            inline: true
          },
          {
            name: '🎯 Cách Nâng',
            value: [
              '`stat atk` - ATK +2',
              '`stat hp` - HP +10',
              '`stat mp` - MP +5',
              '`stat def` - DEF +1',
              '`stat spd` - SPD +1',
              '',
              '`stat atk 3` - ATK +6',
              '`stat reset` - Reset (200 💎)'
            ].join('\n'),
            inline: true
          }
        )
        .setColor(0x00FF00);

      return message.reply({ embeds: [embed] });
    }

    const statMap: Record<string, string> = {
      str: 'attack',
      atk: 'attack',
      int: 'mp',
      vit: 'hp',
      agi: 'speed',
      def: 'defense',
      spd: 'speed'
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

    const limit = stat === 'speed' && player.characterClass === 'rogue' ? 150 : stat === 'speed' && player.characterClass === 'gladiator' ? 70 : STAT_LIMITS[stat];
    if (limit && (player.stats as any)[stat] >= limit) {
      return message.reply(`❌ **${info.name}** đã đạt giới hạn **${limit}**!`);
    }

    if (limit && (player.stats as any)[stat] + info.base * points > limit) {
      return message.reply(`❌ **${info.name}** sẽ vượt giới hạn **${limit}**! Chỉ có thể thêm **${limit - (player.stats as any)[stat]}** điểm.`);
    }

    player.skillPoints -= totalCost;
    player.statPointsUsed = (player.statPointsUsed || 0) + points;

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

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('✅ Nâng Chỉ Số Thành Công!')
      .setDescription(
        `${info.emoji} **${info.name}** +${info.base * points}\n\n` +
        `**Chỉ số mới:**\n` +
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
