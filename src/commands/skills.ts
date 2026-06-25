import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { getSkillsForClass } from '../game/skills';

export const prefixCommand = {
  name: 'skills',
  description: 'Xem kỹ năng',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const allSkills = getSkillsForClass(player.characterClass, 99);
    const unlocked = allSkills.filter(s => player.stats.level >= s.unlockLevel);
    const locked = allSkills.filter(s => player.stats.level < s.unlockLevel);

    const embed = new EmbedBuilder()
      .setTitle('🎯 Kỹ Năng')
      .setDescription(`⭐ Skill Points: **${player.skillPoints}**`)
      .setColor(0x9932CC);

    if (unlocked.length > 0) {
      embed.addFields({
        name: '✅ Đã Mở Khóa',
        value: unlocked.map(s => {
          const learned = player.unlockedSkills.includes(s.id) ? ' [ĐÃ HỌC]' : '';
          return `${s.emoji} **${s.name}** \`${s.id}\` (Lv.${s.unlockLevel}) - MP: ${s.manaCost}${learned}\n> ${s.description}`;
        }).join('\n\n')
      });
    }

    if (locked.length > 0) {
      embed.addFields({
        name: '🔒 Chưa Mở',
        value: locked.map(s =>
          `${s.emoji} **${s.name}** \`${s.id}\` (Cần Lv.${s.unlockLevel})\n> ${s.description}`
        ).join('\n\n')
      });
    }

    embed.setFooter({ text: 'Dùng ,learn <id> để học kỹ năng' });

    message.reply({ embeds: [embed] });
  }
};
