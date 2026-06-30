import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS } from '../game/items';
import { removeItem } from '../game/inventory';
import { updateQuestProgress } from '../game/questProgress';

export const prefixCommand = {
  name: 'poison',
  description: 'Dùng thuốc ngoài combat',
  execute: async (message: any, args: string[], db: Database) => {
    const player = await db.getPlayer(message.author.id);
    if (!player) {
      return message.reply('❌ Bạn chưa tạo nhân vật! Dùng `,create` để bắt đầu.');
    }

    const potions = player.inventory.items.filter((inv: any) => {
      const item = ITEMS[inv.itemId];
      return item && item.type === 'potion' && inv.quantity > 0;
    });

    if (potions.length === 0) {
      return message.reply('❌ Không có thuốc nào trong túi!');
    }

    const embed = new EmbedBuilder()
      .setTitle('🧪 Sử Dụng Thuốc')
      .setDescription('Chọn thuốc muốn sử dụng ngoài combat.')
      .setColor(0x00FF00);

    if (player.expBoostCharges > 0) {
      embed.addFields({ name: '📘 Kinh Nghiệm', value: `Còn **${player.expBoostCharges}** lượt x2 EXP`, inline: false });
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>();
    row.addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('poison_select')
        .setPlaceholder('Chọn thuốc...')
        .addOptions(
          potions.slice(0, 25).map((inv: any) => {
            const item = ITEMS[inv.itemId];
            return {
              label: `${item.emoji} ${item.name}`,
              description: `${item.description?.slice(0, 50)} | SL: ${inv.quantity}`,
              value: item.id
            };
          })
        )
    );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 30000,
      max: 1
    });

    collector.on('collect', async (i: any) => {
      if (i.user.id !== message.author.id) {
        return i.reply({ content: '❌ Không phải thuốc của bạn!', ephemeral: true });
      }

      const potionId = i.values[0];
      const potionItem = ITEMS[potionId];
      const invItem = player.inventory.items.find((inv: any) => inv.itemId === potionId);

      if (!potionItem || !invItem || invItem.quantity <= 0) {
        return i.reply({ content: '❌ Thuốc không tồn tại!', ephemeral: true });
      }

      removeItem(player.inventory, potionId, 1);

      // Quest: potion usage
      await updateQuestProgress(db, player, 'potion', 1);

      let potionMsg = '';

      if (potionItem.id === 'exp_boost_potion') {
        player.expBoostCharges += 3;
        potionMsg = `📘 x2 Kinh Nghiệm trong **3** lần đánh tiếp theo! (Tổng: ${player.expBoostCharges} lượt)`;
      } else {
        return i.reply({ content: '❌ Thuốc này chỉ dùng được trong combat!', ephemeral: true });
      }

      await db.updatePlayer(player);

      const resultEmbed = new EmbedBuilder()
        .setTitle('✅ Dùng Thuốc Thành Công!')
        .setDescription(`${potionItem.emoji} **${potionItem.name}**\n${potionMsg}`)
        .setColor(0x00FF00);

      await i.reply({ embeds: [resultEmbed] });
    });

    collector.on('end', async (collected: any) => {
      if (collected.size === 0) {
        await reply.edit({ components: [] }).catch(() => {});
      }
    });
  }
};
