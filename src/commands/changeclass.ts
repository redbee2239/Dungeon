import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { CLASS_DATA, CharacterClass, createBaseStats } from '../game/classes';

const classMap: Record<string, CharacterClass> = {
  'warrior': 'warrior',
  'mage': 'mage',
  'rogue': 'rogue',
  'cleric': 'cleric',
  'gladiator': 'gladiator',
  'summoner': 'summoner',
  'archer': 'archer',
  'necromancer': 'necromancer'
};

export const prefixCommand = {
  name: 'changeclass',
  aliases: ['cc', 'doiclass'],
  description: 'Đổi class (reset level)',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const classInput = args[0]?.toLowerCase();
    if (!classInput || !classMap[classInput]) {
      const embed = new EmbedBuilder()
        .setTitle('🔄 Đổi Class')
        .setDescription(
          'Cách dùng: `,changeclass <class>`\n\n' +
          '**Lưu ý:**\n' +
          '- Level sẽ reset về 1\n' +
          '- Dungeon sẽ reset về tầng 1\n' +
          '- Inventory giữ nguyên\n' +
          '- Skill points sẽ reset về 0\n\n' +
          '**Lớp có sẵn:**\n' +
          '⚔️ `warrior` - Chiến Binh\n' +
          '🔮 `mage` - Pháp Sư\n' +
          '🗡️ `rogue` - Sát Thủ\n' +
          '✝️ `cleric` - Tu Sĩ\n' +
          '🏟️ `gladiator` - Đấu Sĩ\n' +
          '🔮 `summoner` - Triệu Hồi Sư\n' +
          '🏹 `archer` - Cung Thủ\n' +
          '💀 `necromancer` - Âm Linh Sư'
        )
        .setColor(0xFF6600);
      return message.reply({ embeds: [embed] });
    }

    const newClass = classMap[classInput];
    if (newClass === player.characterClass) {
      return message.reply('❌ Bạn đang là class này rồi!');
    }

    const newStats = createBaseStats(newClass);
    const newClassName = CLASS_DATA[newClass].name;
    const oldClassName = CLASS_DATA[player.characterClass].name;

    player.characterClass = newClass;
    player.stats = newStats;
    player.stats.gold = player.stats.gold;
    player.dungeon.currentFloor = 1;
    player.dungeon.roomsExplored = 0;
    player.dungeon.monstersDefeated = 0;
    player.highestFloor = 1;
    player.skillPoints = 0;

    const starterSkills: Record<CharacterClass, string> = {
      warrior: 'basic_slash',
      mage: 'spark',
      rogue: 'quick_strike',
      cleric: 'holy_smite',
      gladiator: 'battle_cry',
      summoner: 'summon_wolf',
      archer: 'quick_shot',
      necromancer: 'drain_life'
    };
    player.unlockedSkills = [starterSkills[newClass]];
    player.equippedSkill = null;

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('🔄 Đổi Class Thành Công!')
      .setDescription(
        `**${oldClassName}** → **${newClassName}**\n\n` +
        `📊 Level: **1**\n` +
        `🏰 Dungeon: **Tầng 1**\n` +
        `📦 Inventory: **Giữ nguyên**\n\n` +
        `❤️ HP: ${newStats.hp}/${newStats.maxHP}\n` +
        `💧 MP: ${newStats.mp}/${newStats.maxMP}\n` +
        `⚔️ ATK: ${newStats.attack}\n` +
        `🛡️ DEF: ${newStats.defense}\n` +
        `💨 SPD: ${newStats.speed}`
      )
      .setColor(0x00FF00);

    message.reply({ embeds: [embed] });
  }
};
