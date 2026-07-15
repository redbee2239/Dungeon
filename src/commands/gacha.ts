import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS, RARITY_NAMES, RARITY_COLORS, ItemRarity, Item } from '../game/items';
import { isBeta, isSecretChannel } from '../game/beta';

const GACHA_COST = 150;
const MULTI_COST = 1350;

const BETA_1_3_COST_SINGLE = 120;
const BETA_1_3_COST_MULTI = 1080;
const BETA_1_3_RAINBOW_PITY = 30;
const BETA_1_3_SSR_PITY = 10;

const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 40,
  uncommon: 30,
  rare: 20,
  epic: 8,
  legendary: 2,
  limited: 0
};

const GACHA_ITEMS = Object.values(ITEMS).filter(item => item.type !== 'potion');

const EPIC_PITY = 50;
const LEGENDARY_PITY = 150;

const RARITY_EMOJI: Record<ItemRarity, string> = {
  common: '⚪',
  uncommon: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟠',
  limited: '🔴'
};

function rollRarity(pityEpic: number, pityLegendary: number): ItemRarity {
  if (pityLegendary >= LEGENDARY_PITY) return 'legendary';
  if (pityEpic >= EPIC_PITY) return 'epic';

  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) return rarity as ItemRarity;
  }
  return 'common';
}

function rollRarityBeta(pityEpic: number, pityLegendary: number): ItemRarity {
  if (pityLegendary >= BETA_1_3_RAINBOW_PITY) return 'legendary';
  if (pityEpic >= BETA_1_3_SSR_PITY) return 'epic';

  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) return rarity as ItemRarity;
  }
  return 'common';
}

function rollItem(pityEpic: number, pityLegendary: number): Item {
  const rarity = rollRarity(pityEpic, pityLegendary);
  const pool = GACHA_ITEMS.filter(i => i.rarity === rarity);
  if (pool.length === 0) return GACHA_ITEMS[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollItemBeta(pityEpic: number, pityLegendary: number): Item {
  const rarity = rollRarityBeta(pityEpic, pityLegendary);
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
    const betaActive = isBeta() || isSecretChannel(message.channel.id);

    const gachaCost = betaActive ? BETA_1_3_COST_SINGLE : GACHA_COST;
    const multiCost = betaActive ? BETA_1_3_COST_MULTI : MULTI_COST;
    const epicPity = betaActive ? BETA_1_3_SSR_PITY : EPIC_PITY;
    const legendaryPity = betaActive ? BETA_1_3_RAINBOW_PITY : LEGENDARY_PITY;

    if (!action || !['1', '10', 'single', 'multi', 'roll', 'history'].includes(action)) {
      const embed = new EmbedBuilder()
        .setTitle(betaActive ? '🎲 BETA GACHA' : '🎰 Gacha Trang Bị')
        .setDescription(
          `**Chi phí:**\n` +
          `- 1 lần: **${gachaCost}** 💎\n` +
          `- 10 lần: **${multiCost}** 💎 (-10%)\n\n` +
          `**Gem của bạn:** ${player.gems} 💎`
        )
        .addFields(
          {
            name: '📊 Tỷ Lệ',
            value: [
              `${RARITY_EMOJI.common} Phổ Thông: **40%**`,
              `${RARITY_EMOJI.uncommon} Thông Thường: **30%**`,
              `${RARITY_EMOJI.rare} Hiếm: **20%**`,
              `${RARITY_EMOJI.epic} Sử Thi: **8%** (pity: ${epicPity})`,
              `${RARITY_EMOJI.legendary} Huyền Thoại: **2%** (pity: ${legendaryPity})`
            ].join('\n'),
            inline: true
          },
          {
            name: '💡 Cách Dùng',
            value: [
              '`gacha 1` - Quay 1 lần',
              '`gacha 10` - Quay 10 lần',
              '`gacha history` - Xem lịch sử'
            ].join('\n'),
            inline: true
          }
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
    const cost = isMulti ? multiCost : gachaCost;

    if (player.gems < cost) {
      return message.reply(`❌ Không đủ Gem! Cần ${cost} 💎 (Bạn có ${player.gems} 💎)`);
    }

    await db.removeGems(player, cost);

    const results: { item: Item; isNew: boolean }[] = [];
    const rollCount = isMulti ? 10 : 1;

    for (let i = 0; i < rollCount; i++) {
      const item = betaActive
        ? rollItemBeta(player.gachaPity.epic, player.gachaPity.legendary)
        : rollItem(player.gachaPity.epic, player.gachaPity.legendary);
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

      if (item.rarity === 'legendary') {
        player.gachaPity.legendary = 0;
        player.gachaPity.epic = 0;
      } else if (item.rarity === 'epic') {
        player.gachaPity.legendary += 1;
        player.gachaPity.epic = 0;
      } else {
        player.gachaPity.legendary += 1;
        player.gachaPity.epic += 1;
      }
    }

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle(isMulti
        ? (betaActive ? '🎲 BETA Gacha 10 Lượt' : '🎰 Gacha 10 Lượt')
        : (betaActive ? '🎲 BETA Gacha 1 Lượt' : '🎰 Gacha 1 Lượt'))
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
          desc += `\n**${RARITY_EMOJI[rarity]} ${RARITY_NAMES[rarity]}:**\n`;
          items.forEach(r => {
            desc += `${r.item.emoji} **${r.item.name}**${r.isNew ? ' ✨' : ''}\n`;
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
        `${item.emoji} **${item.name}**\n\n` +
        `**Rarity:** ${RARITY_EMOJI[item.rarity]} ${RARITY_NAMES[item.rarity]}\n` +
        `**Type:** ${item.type === 'weapon' ? '⚔️ Vũ khí' : item.type === 'armor' ? '🛡️ Giáp' : '💍 Phụ kiện'}\n` +
        (statsText ? `\n**Stats:**\n${statsText}\n` : '') +
        `\n_${item.description}_\n\n` +
        `${isNew ? '✨ **Trang bị mới!**' : '⚠️ Đã có trang bị này (+1)'}` +
        `\n\n\`ID: ${item.id}\``
      );
      embed.setColor(RARITY_COLORS[item.rarity]);
    }

    embed.setFooter({ text: `Gem còn lại: ${player.gems} 💎 | Pity Epic: ${player.gachaPity.epic}/${epicPity} | Pity Legendary: ${player.gachaPity.legendary}/${legendaryPity}` });

    message.reply({ embeds: [embed] });
  }
};
