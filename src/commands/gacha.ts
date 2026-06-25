import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Database } from '../game/database';
import { getRandomSkill, getSkillById, SKILL_RARITY_NAMES, SKILL_RARITY_COLORS, Skill } from '../game/skills';

const GACHA_COST = 50;
const MULTI_COST = 450;

export const prefixCommand = {
  name: 'gacha',
  description: 'Quay gacha kỹ năng',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['1', '10', 'single', 'multi', 'roll', 'history'].includes(action)) {
      const embed = new EmbedBuilder()
        .setTitle('🎰 Gacha Kỹ Năng')
        .setDescription(`Chi phí:\n- 1 lần: **${GACHA_COST}** 💎\n- 10 lần: **${MULTI_COST}** 💎 (-10%)\n\nGem của bạn: **${player.gems}** 💎`)
        .addFields(
          { name: '📊 Tỷ Lệ', value: [
            '⚪ Common: 40%',
            '🟢 Uncommon: 30%',
            '🔵 Rare: 20%',
            '🟣 Epic: 8%',
            '🟠 Legendary: 2%'
          ].join('\n') },
          { name: '💡 Cách Dùng', value: [
            ',gacha 1 - Quay 1 lần',
            ',gacha 10 - Quay 10 lần',
            ',gacha history - Xem lịch sử'
          ].join('\n') }
        )
        .setColor(0xFF8000);

      return message.reply({ embeds: [embed] });
    }

    if (action === 'history') {
      const history = player.gachaHistory.slice(-10).reverse();
      if (history.length === 0) {
        return message.reply('📜 Chưa có lịch sử gacha!');
      }

      const embed = new EmbedBuilder()
        .setTitle('📜 Lịch Sử Gacha (10 gần nhất)')
        .setDescription(history.map(h => {
          const skill = getSkillById(h.skillId);
          return `${skill?.emoji || '?'} ${skill?.name || h.skillId} (${SKILL_RARITY_NAMES[h.rarity as keyof typeof SKILL_RARITY_NAMES]})`;
        }).join('\n'))
        .setColor(0x0099FF);

      return message.reply({ embeds: [embed] });
    }

    const isMulti = action === '10' || action === 'multi';
    const cost = isMulti ? MULTI_COST : GACHA_COST;

    if (player.gems < cost) {
      return message.reply(`❌ Không đủ Gem! Cần ${cost} 💎 (Bạn có ${player.gems} 💎)`);
    }

    await db.removeGems(player, cost);

    const results: { skill: Skill; isNew: boolean }[] = [];
    const rollCount = isMulti ? 10 : 1;

    for (let i = 0; i < rollCount; i++) {
      const skill = getRandomSkill();
      const isNew = !player.unlockedSkills.includes(skill.id);
      results.push({ skill, isNew });

      if (isNew) {
        player.unlockedSkills.push(skill.id);
        player.gachaHistory.push({
          skillId: skill.id,
          rarity: skill.rarity,
          date: new Date()
        });
      }
    }

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle(isMulti ? '🎰 Gacha 10 Lượt' : '🎰 Gacha 1 Lượt')
      .setDescription(`Sử dụng **${cost}** 💎`)
      .setColor(0xFF8000);

    if (isMulti) {
      const grouped = results.reduce((acc, r) => {
        const rarity = r.skill.rarity;
        if (!acc[rarity]) acc[rarity] = [];
        acc[rarity].push(r);
        return acc;
      }, {} as Record<string, { skill: Skill; isNew: boolean }[]>);

      let desc = '';
      for (const rarity of ['legendary', 'epic', 'rare', 'uncommon', 'common'] as const) {
        const items = grouped[rarity];
        if (items && items.length > 0) {
          desc += `\n**${SKILL_RARITY_NAMES[rarity]}:**\n`;
          items.forEach(r => {
            desc += `${r.skill.emoji} ${r.skill.name}${r.isNew ? ' ✨' : ''}\n`;
          });
        }
      }

      embed.setDescription(desc || 'Không có gì mới...');
    } else {
      const { skill, isNew } = results[0];
      embed.setDescription(
        `${skill.emoji} **${skill.name}**\n` +
        `Rarity: ${SKILL_RARITY_NAMES[skill.rarity]}\n` +
        `Class: ${skill.class}\n` +
        `MP: ${skill.manaCost} | Damage: ${skill.damage * 100}%\n` +
        `${skill.description}\n\n` +
        `${isNew ? '✨ Kỹ năng mới!' : '⚠️ Đã có kỹ năng này'}`
      );
      embed.setColor(SKILL_RARITY_COLORS[skill.rarity]);
    }

    embed.setFooter({ text: `Gem còn lại: ${player.gems} 💎` });

    message.reply({ embeds: [embed] });
  }
};
