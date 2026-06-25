import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { getSkillsForClass } from '../game/skills';

export const prefixCommand = {
  name: 'learn',
  description: 'Học kỹ năng mới',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    if (player.skillPoints <= 0) {
      return message.reply('❌ Không còn skill points! Lên level để nhận thêm.');
    }

    const skillId = args[0]?.toLowerCase();
    if (!skillId) {
      return message.reply('❌ Dùng `,learn <id_kỹ_năng>`\nXem danh sách bằng `,skills`');
    }

    const available = getSkillsForClass(player.characterClass, player.stats.level);
    const skill = available.find(s => s.id === skillId || s.name.toLowerCase() === skillId);

    if (!skill) {
      return message.reply('❌ Không tìm thấy kỹ năng hoặc chưa đủ level!');
    }

    if (player.unlockedSkills.includes(skill.id)) {
      return message.reply('❌ Bạn đã học kỹ năng này rồi!');
    }

    player.unlockedSkills.push(skill.id);
    player.skillPoints -= 1;
    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Học Kỹ Năng Thành Công!')
      .setDescription(`${skill.emoji} **${skill.name}**\n${skill.description}\n\nMP: ${skill.manaCost} | Damage: ${skill.damage * 100}%`)
      .setColor(0x00FF00);

    message.reply({ embeds: [embed] });
  }
};
