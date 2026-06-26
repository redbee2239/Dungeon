import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { calculateBonusStats } from '../game/inventory';

export const prefixCommand = {
  name: 'heal',
  description: 'Hồi phục HP/MP',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const bonus = calculateBonusStats(player.inventory, player.equippedPet);
    const totalHP = player.stats.maxHP + bonus.hp;
    const totalMP = player.stats.maxMP + bonus.mp;

    if (player.stats.hp >= totalHP && player.stats.mp >= totalMP) {
      return message.reply('✅ HP và MP đã đầy rồi!');
    }

    const goldCost = Math.floor(10 + player.stats.level * 2);
    if (player.stats.gold < goldCost) {
      return message.reply(`❌ Không đủ gold! Cần ${goldCost} gold.`);
    }

    await db.removeGold(player, goldCost);
    player.stats.hp = totalHP;
    player.stats.mp = totalMP;
    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle('💚 Hồi Phục!')
      .setDescription(`HP: ${totalHP}/${totalHP}\nMP: ${totalMP}/${totalMP}\n💰 -${goldCost} Gold`)
      .setColor(0x00FF00);

    message.reply({ embeds: [embed] });
  }
};
