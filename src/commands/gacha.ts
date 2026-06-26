import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, RARITY_NAMES, RARITY_COLORS, ItemRarity, Item } from '../game/items';

const GACHA_COST = 50;
const MULTI_COST = 450;

const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 40,
  uncommon: 30,
  rare: 20,
  epic: 8,
  legendary: 2
};

const GACHA_ITEMS = Object.values(ITEMS).filter(item => item.type !== 'potion');

function rollRarity(): ItemRarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) return rarity as ItemRarity;
  }
  return 'common';
}

function rollItem(): Item {
  const rarity = rollRarity();
  const pool = GACHA_ITEMS.filter(i => i.rarity === rarity);
  if (pool.length === 0) return GACHA_ITEMS[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const prefixCommand = {
  name: 'gacha',
  description: 'Quay gacha trang bị',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create` để tạo.');
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['1', '10', 'single', 'multi', 'roll', 'history'].includes(action)) {
      const embed = new EmbedBuilder()
        .setTitle('🎰 Gacha Trang Bị')
        .setDescription(`Chi phí:\n- 1 lần: **${GACHA_COST}** 💎\n- 10 lần: **${MULTI_COST}** 💎 (-10%)\n\nGem của bạn: **${player.gems}** 💎`)
        .addFields(
          { name: '📊 Tỷ Lệ', value: [
            '⚪ Phổ Thông: 40%',
            '🟢 Thông Thường: 30%',
            '🔵 Hiếm: 20%',
            '🟣 Sử Thi: 8%',
            '🟠 Huyền Thoại: 2%'
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
          const item = ITEMS[h.skillId];
          return `${item?.emoji || '?'} ${item?.name || h.skillId} (${RARITY_NAMES[h.rarity as keyof typeof RARITY_NAMES] || h.rarity})`;
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

    const results: { item: Item; isNew: boolean }[] = [];
    const rollCount = isMulti ? 10 : 1;

    for (let i = 0; i < rollCount; i++) {
      const item = rollItem();
      const existing = player.inventory.items.find((inv: any) => inv.itemId === item.id);
      const isNew = !existing || existing.quantity === 0;
      results.push({ item, isNew });

      if (existing) {
        existing.quantity += 1;
      } else {
        player.inventory.items.push({ itemId: item.id, quantity: 1 });
      }

      player.gachaHistory.push({
        skillId: item.id,
        rarity: item.rarity,
        date: new Date()
      });
    }

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle(isMulti ? '🎰 Gacha 10 Lượt' : '🎰 Gacha 1 Lượt')
      .setDescription(`Sử dụng **${cost}** 💎`)
      .setColor(0xFF8000);

    if (isMulti) {
      const grouped = results.reduce((acc, r) => {
        const rarity = r.item.rarity;
        if (!acc[rarity]) acc[rarity] = [];
        acc[rarity].push(r);
        return acc;
      }, {} as Record<string, { item: Item; isNew: boolean }[]>);

      let desc = '';
      for (const rarity of ['legendary', 'epic', 'rare', 'uncommon', 'common'] as const) {
        const items = grouped[rarity];
        if (items && items.length > 0) {
          desc += `\n**${RARITY_NAMES[rarity]}:**\n`;
          items.forEach(r => {
            desc += `${r.item.emoji} ${r.item.name}${r.isNew ? ' ✨' : ''}\n`;
          });
        }
      }

      embed.setDescription(desc || 'Không có gì mới...');
    } else {
      const { item, isNew } = results[0];
      let statsText = '';
      if (item.stats) {
        statsText = Object.entries(item.stats)
          .filter(([_, v]) => v && v !== 0)
          .map(([k, v]) => `${k.toUpperCase()}: +${v}`)
          .join('\n');
      }

      embed.setDescription(
        `${item.emoji} **${item.name}**\n` +
        `Rarity: ${RARITY_NAMES[item.rarity]}\n` +
        `Type: ${item.type === 'weapon' ? '⚔️ Vũ khí' : item.type === 'armor' ? '🛡️ Giáp' : '💍 Phụ kiện'}\n` +
        `${statsText ? `Stats:\n${statsText}\n` : ''}` +
        `${item.description}\n\n` +
        `${isNew ? '✨ Trang bị mới!' : '⚠️ Đã có trang bị này (+1)'}` +
        `\nID: \`${item.id}\``
      );
      embed.setColor(RARITY_COLORS[item.rarity]);
    }

    embed.setFooter({ text: `Gem còn lại: ${player.gems} 💎` });

    message.reply({ embeds: [embed] });
  }
};
