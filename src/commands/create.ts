import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { CLASS_DATA, CharacterClass } from '../game/classes';

const classMap: Record<string, CharacterClass> = {
  'warrior': 'warrior',
  'chiênbinh': 'warrior',
  'mage': 'mage',
  'phapsư': 'mage',
  'rogue': 'rogue',
  'sátthủ': 'rogue',
  'cleric': 'cleric',
  'tusĩ': 'cleric',
  'gladiator': 'gladiator',
  'đausĩ': 'gladiator',
  'summoner': 'summoner',
  'triệuhồi': 'summoner',
  'th': 'summoner',
  'archer': 'archer',
  'cungthủ': 'archer',
  'ct': 'archer',
  '1': 'warrior',
  '2': 'mage',
  '3': 'rogue',
  '4': 'cleric',
  '5': 'gladiator',
  '6': 'summoner',
  '7': 'archer'
};

export const prefixCommand = {
  name: 'create',
  description: 'Tạo nhân vật mới',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;

    const existing = await db.getPlayer(userId);
    if (existing) {
      return message.reply('❌ Bạn đã có nhân vật rồi! Dùng `,profile` để xem.');
    }

    const classInput = args[0]?.toLowerCase();
    if (!classInput || !classMap[classInput]) {
      const embed = new EmbedBuilder()
        .setTitle('❌ Chọn lớp nhân vật')
        .setDescription('Cách dùng: `,create <lớp>`\n\n**Lớp có sẵn:**\n⚔️ `warrior` - Chiến Binh\n🔮 `mage` - Pháp Sư\n🗡️ `rogue` - Sát Thủ\n✝️ `cleric` - Tu Sĩ\n🏟️ `gladiator` - Đấu Sĩ\n🔮 `summoner` - Triệu Hồi Sư\n🏹 `archer` - Cung Thủ')
        .setColor(0xFF0000);
      return message.reply({ embeds: [embed] });
    }

    const characterClass = classMap[classInput];
    const cls = CLASS_DATA[characterClass];
    const player = await db.createPlayer(userId, message.author.username, characterClass);

    const embed = new EmbedBuilder()
      .setTitle(`${cls.emoji} Tạo Nhân Vật Thành Công!`)
      .setDescription(`Chào mừng **${message.author.username}** đến với dungeon!`)
      .addFields(
        { name: 'Lớp', value: `${cls.emoji} ${cls.name}`, inline: true },
        { name: 'HP', value: `${cls.baseHP}`, inline: true },
        { name: 'MP', value: `${cls.baseMP}`, inline: true },
        { name: 'ATK', value: `${cls.baseAttack}`, inline: true },
        { name: 'DEF', value: `${cls.baseDefense}`, inline: true },
        { name: 'SPD', value: `${cls.baseSpeed}`, inline: true }
      )
      .setColor(0x00FF00)
      .setFooter({ text: 'Dùng ,dungeon để bắt đầu!' });

    message.reply({ embeds: [embed] });
  }
};
