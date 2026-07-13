import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, RARITY_NAMES, RARITY_COLORS, ItemRarity, ItemType } from '../game/items';
import { CLASS_DATA, CharacterClass } from '../game/classes';

const PHYSICAL_CLASSES: CharacterClass[] = ['warrior', 'rogue', 'gladiator', 'archer'];
const MAGIC_CLASSES: CharacterClass[] = ['mage', 'cleric', 'summoner'];

const RARITY_EMOJI: Record<ItemRarity, string> = {
  common: '⚪',
  uncommon: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟠',
  limited: '🔴'
};

const SLOT_INFO: Record<string, { name: string; emoji: string }> = {
  weapon: { name: 'Vũ Khí', emoji: '⚔️' },
  armor: { name: 'Giáp', emoji: '🛡️' },
  accessory: { name: 'Phụ Kiện', emoji: '💍' }
};

function formatStats(stats: Record<string, number> | undefined): string {
  if (!stats) return 'Không có stats';
  return Object.entries(stats)
    .filter(([_, v]) => v && v !== 0)
    .map(([k, v]) => `${k.toUpperCase()}: **+${v}**`)
    .join(' | ');
}

export const prefixCommand = {
  name: 'equip',
  description: 'Trang bị vật phẩm',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['list', 'xem'].includes(action)) {
      const itemId = args[0]?.toLowerCase();
      if (!itemId) {
        const embed = new EmbedBuilder()
          .setTitle('⚔️ Trang Bị')
          .setDescription(
            '**Cách dùng:**\n' +
            '`equip <id>` - Trang bị vật phẩm\n' +
            '`unequip <slot>` - Tháo trang bị\n' +
            '`equip list` - Xem trang bị đang đeo\n\n' +
            '**Slot:** weapon, armor, accessory'
          )
          .setColor(0xFF6600);
        return message.reply({ embeds: [embed] });
      }

      const item = ITEMS[itemId];
      if (!item) {
        return message.reply('❌ Không tìm thấy vật phẩm!');
      }

      if (item.type === 'potion') {
        return message.reply('❌ Không thể trang bị thuốc!');
      }

      const invItem = player.inventory.items.find((i: any) => i.itemId === itemId);
      if (!invItem || invItem.quantity <= 0) {
        return message.reply('❌ Bạn không có vật phẩm này!');
      }

      if (item.type === 'weapon') {
        const isPhysical = PHYSICAL_CLASSES.includes(player.characterClass);
        const isMagic = MAGIC_CLASSES.includes(player.characterClass);

        if (item.classRestriction && !item.classRestriction.includes(player.characterClass)) {
          const className = CLASS_DATA[player.characterClass].name;
          return message.reply(`❌ Class **${className}** không thể dùng vũ khí này!`);
        }

        if (!item.classRestriction) {
          if (item.weaponType === 'physical' && !isPhysical) {
            const className = CLASS_DATA[player.characterClass].name;
            return message.reply(`❌ Class **${className}** chỉ dùng được vũ khí phép!`);
          }
          if (item.weaponType === 'magic' && !isMagic) {
            const className = CLASS_DATA[player.characterClass].name;
            return message.reply(`❌ Class **${className}** chỉ dùng được vũ khí sát thương!`);
          }
        }
      }

      const equipType = item.type as 'weapon' | 'armor' | 'accessory';
      const currentlyEquipped = player.inventory.equipped[equipType];

      if (currentlyEquipped === itemId) {
        return message.reply('❌ Bạn đã trang bị vật phẩm này rồi!');
      }

      player.inventory.equipped[equipType] = itemId;
      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('✅ Trang Bị Thành Công!')
        .setDescription(
          `${item.emoji} **${item.name}**\n\n` +
          `**Slot:** ${SLOT_INFO[equipType].emoji} ${SLOT_INFO[equipType].name}\n` +
          `**Rarity:** ${RARITY_EMOJI[item.rarity]} ${RARITY_NAMES[item.rarity]}\n\n` +
          `**Stats:** ${formatStats(item.stats)}`
        )
        .setColor(RARITY_COLORS[item.rarity]);

      return message.reply({ embeds: [embed] });
    }

    if (action === 'list' || action === 'xem') {
      const equipped = player.inventory.equipped;
      
      const embed = new EmbedBuilder()
        .setTitle('⚔️ Trang Bị Hiện Tại')
        .setDescription('Những vật phẩm đang được trang bị:')
        .setColor(0xFF6600);

      const slots = [
        { type: 'weapon', id: equipped.weapon },
        { type: 'armor', id: equipped.armor },
        { type: 'accessory', id: equipped.accessory }
      ];

      for (const slot of slots) {
        const info = SLOT_INFO[slot.type];
        if (slot.id) {
          const item = ITEMS[slot.id];
          if (item) {
            embed.addFields({
              name: `${info.emoji} ${info.name}`,
              value: `${item.emoji} **${item.name}**\n${RARITY_EMOJI[item.rarity]} ${RARITY_NAMES[item.rarity]}\n${formatStats(item.stats)}\n\`ID: ${item.id}\``,
              inline: true
            });
          }
        } else {
          embed.addFields({
            name: `${info.emoji} ${info.name}`,
            value: '*Trống*',
            inline: true
          });
        }
      }

      return message.reply({ embeds: [embed] });
    }
  }
};
