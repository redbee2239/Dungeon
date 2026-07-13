import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { getSkillsForClass, Skill, SkillRarity, SKILL_RARITY_NAMES, SKILL_RARITY_COLORS } from '../game/skills';

const SKILL_RARITY_EMOJI: Record<SkillRarity, string> = {
  common: '⚪',
  uncommon: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟠'
};

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
      .setDescription(`⭐ Skill Points: **${player.skillPoints}** | Level: **${player.stats.level}**`)
      .setColor(0x9932CC);

    if (unlocked.length > 0) {
      const learned = unlocked.filter(s => player.unlockedSkills.includes(s.id));
      const notLearned = unlocked.filter(s => !player.unlockedSkills.includes(s.id));

      if (learned.length > 0) {
        embed.addFields({
          name: `✅ Đã Học (${learned.length})`,
          value: learned.map(s =>
            `${s.emoji} **${s.name}** \`${s.id}\`\n` +
            `> Lv.${s.unlockLevel} | MP: ${s.manaCost} | DMG: ${s.damage}x\n` +
            `> _${s.description}_`
          ).join('\n\n')
        });
      }

      if (notLearned.length > 0) {
        embed.addFields({
          name: `🔓 Có Thể Học (${notLearned.length})`,
          value: notLearned.map(s =>
            `${s.emoji} **${s.name}** \`${s.id}\`\n` +
            `> Lv.${s.unlockLevel} | MP: ${s.manaCost} | DMG: ${s.damage}x\n` +
            `> _${s.description}_`
          ).join('\n\n')
        });
      }
    }

    if (locked.length > 0) {
      embed.addFields({
        name: `🔒 Chưa Mở Khóa (${locked.length})`,
        value: locked.map(s =>
          `${s.emoji} **${s.name}** \`${s.id}\`\n` +
          `> Cần Lv.${s.unlockLevel} | MP: ${s.manaCost} | DMG: ${s.damage}x\n` +
          `> _${s.description}_`
        ).join('\n\n')
      });
    }

    embed.setFooter({ text: 'Dùng ,learn <id> để học kỹ năng' });

    message.reply({ embeds: [embed] });
  }
};
