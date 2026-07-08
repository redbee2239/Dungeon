import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { ITEMS } from '../game/items';
import { isBeta, isSecretChannel } from '../game/beta';

interface TradeOffer {
  gold: number;
  gems: number;
  items: { itemId: string; quantity: number }[];
}

interface TradeSession {
  id: string;
  player1: string;
  player2: string;
  offer1: TradeOffer;
  offer2: TradeOffer;
  confirm1: boolean;
  confirm2: boolean;
  message: any;
  timeout: NodeJS.Timeout;
}

const trades = new Map<string, TradeSession>();

function buildTradeEmbed(session: TradeSession, p1Name: string, p2Name: string): EmbedBuilder {
  const fmtItems = (offer: TradeOffer) => {
    const lines: string[] = [];
    if (offer.gold > 0) lines.push(`💰 ${offer.gold} Gold`);
    if (offer.gems > 0) lines.push(`💎 ${offer.gems} Gem`);
    for (const it of offer.items) {
      const item = ITEMS[it.itemId];
      lines.push(`${item?.emoji || '?'} ${item?.name || it.itemId} x${it.quantity}`);
    }
    return lines.length > 0 ? lines.join('\n') : '_(Trống)_';
  };

  return new EmbedBuilder()
    .setTitle('🤝 Giao Dịch')
    .setDescription(
      `**${p1Name}** ↔️ **${p2Name}**\n` +
      `Hết hạn sau 60 giây.`
    )
    .addFields(
      { name: `${p1Name} đề nghị:`, value: fmtItems(session.offer1), inline: true },
      { name: `${p2Name} đề nghị:`, value: fmtItems(session.offer2), inline: true },
      { name: 'Trạng thái', value: `${session.confirm1 ? '✅' : '⏳'} ${p1Name} | ${session.confirm2 ? '✅' : '⏳'} ${p2Name}` }
    )
    .setColor(0xFFAA00);
}

function buildRows(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('trade_add_gold').setLabel('💰 Thêm Gold').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('trade_add_gem').setLabel('💎 Thêm Gem').setStyle(ButtonStyle.Primary),
  );
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('trade_confirm').setLabel('✅ Xác Nhận').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('trade_cancel').setLabel('❌ Hủy').setStyle(ButtonStyle.Danger),
  );
  return [row1, row2];
}

function cleanup(session: TradeSession) {
  clearTimeout(session.timeout);
  trades.delete(session.id);
}

async function executeTrade(session: TradeSession, db: Database) {
  const p1 = await db.getPlayer(session.player1);
  const p2 = await db.getPlayer(session.player2);
  if (!p1 || !p2) return;

  // Validate both players have the resources
  if (p1.stats.gold < session.offer1.gold || p1.gems < session.offer1.gems) {
    session.message.edit({ content: '❌ Giao dịch thất bại: ' + p1.name + ' không đủ tài nguyên!', embeds: [], components: [] });
    return;
  }
  if (p2.stats.gold < session.offer2.gold || p2.gems < session.offer2.gems) {
    session.message.edit({ content: '❌ Giao dịch thất bại: ' + p2.name + ' không đủ tài nguyên!', embeds: [], components: [] });
    return;
  }

  // Validate items
  for (const it of session.offer1.items) {
    const inv = p1.inventory.items.find((i: any) => i.itemId === it.itemId);
    if (!inv || inv.quantity < it.quantity) {
      session.message.edit({ content: '❌ Giao dịch thất bại: ' + p1.name + ' không đủ vật phẩm!', embeds: [], components: [] });
      return;
    }
  }
  for (const it of session.offer2.items) {
    const inv = p2.inventory.items.find((i: any) => i.itemId === it.itemId);
    if (!inv || inv.quantity < it.quantity) {
      session.message.edit({ content: '❌ Giao dịch thất bại: ' + p2.name + ' không đủ vật phẩm!', embeds: [], components: [] });
      return;
    }
  }

  // Execute the swap
  // Gold
  p1.stats.gold -= session.offer1.gold;
  p1.stats.gold += session.offer2.gold;
  p2.stats.gold -= session.offer2.gold;
  p2.stats.gold += session.offer1.gold;

  // Gems
  p1.gems -= session.offer1.gems;
  p1.gems += session.offer2.gems;
  p2.gems -= session.offer2.gems;
  p2.gems += session.offer1.gems;

  // Items - remove from offerer, add to receiver
  for (const it of session.offer1.items) {
    const inv1 = p1.inventory.items.find((i: any) => i.itemId === it.itemId)!;
    inv1.quantity -= it.quantity;
    if (inv1.quantity <= 0) {
      p1.inventory.items = p1.inventory.items.filter((i: any) => i.itemId !== it.itemId);
    }
    const existing2 = p2.inventory.items.find((i: any) => i.itemId === it.itemId);
    if (existing2) {
      existing2.quantity += it.quantity;
    } else {
      p2.inventory.items.push({ itemId: it.itemId, quantity: it.quantity });
    }
  }
  for (const it of session.offer2.items) {
    const inv2 = p2.inventory.items.find((i: any) => i.itemId === it.itemId)!;
    inv2.quantity -= it.quantity;
    if (inv2.quantity <= 0) {
      p2.inventory.items = p2.inventory.items.filter((i: any) => i.itemId !== it.itemId);
    }
    const existing1 = p1.inventory.items.find((i: any) => i.itemId === it.itemId);
    if (existing1) {
      existing1.quantity += it.quantity;
    } else {
      p1.inventory.items.push({ itemId: it.itemId, quantity: it.quantity });
    }
  }

  await db.updatePlayer(p1);
  await db.updatePlayer(p2);

  session.message.edit({
    content: '✅ Giao dịch thành công!',
    embeds: [new EmbedBuilder().setTitle('🤝 Giao Dịch Hoàn Tất').setDescription(`**${p1.name}** ↔️ **${p2.name}** đã hoàn tất giao dịch!`).setColor(0x00FF00)],
    components: []
  });
}

export const prefixCommand = {
  name: 'trade',
  aliases: ['gdich'],
  description: 'Giao dịch với người chơi khác',
  execute: async (message: any, args: string[], db: Database) => {
    if (!isBeta() && !isSecretChannel(message.channel.id)) {
      return message.reply('❌ Tính năng này chưa được mở! Dùng `,open beta 1.3` để kích hoạt.');
    }

    const userId = message.author.id;

    // Parse target user from mention
    const targetId = message.mentions.users.first()?.id;
    if (!targetId) {
      return message.reply('❌ Dùng: `,trade @user`');
    }

    if (targetId === userId) {
      return message.reply('❌ Không thể giao dịch với chính mình!');
    }

    const player = await db.getPlayer(userId);
    const target = await db.getPlayer(targetId);

    if (!player) return message.reply('❌ Bạn chưa có nhân vật!');
    if (!target) return message.reply('❌ Người kia chưa có nhân vật!');

    // Check for existing trade
    for (const [, t] of trades) {
      if (t.player1 === userId || t.player2 === userId || t.player1 === targetId || t.player2 === targetId) {
        return message.reply('❌ Đang có giao dịch chưa hoàn tất!');
      }
    }

    const tradeId = `${userId}_${targetId}_${Date.now()}`;
    const timeout = setTimeout(() => {
      const s = trades.get(tradeId);
      if (s) {
        s.message.edit({ content: '⏰ Giao dịch đã hết hạn!', embeds: [], components: [] });
        cleanup(s);
      }
    }, 60000);

    const session: TradeSession = {
      id: tradeId,
      player1: userId,
      player2: targetId,
      offer1: { gold: 0, gems: 0, items: [] },
      offer2: { gold: 0, gems: 0, items: [] },
      confirm1: false,
      confirm2: false,
      message: null,
      timeout
    };
    trades.set(tradeId, session);

    const embed = buildTradeEmbed(session, message.author.username, message.mentions.users.first()!.username);
    const rows = buildRows();

    const reply = await message.reply({ embeds: [embed], components: rows });
    session.message = reply;

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async (interaction: any) => {
      if (interaction.user.id !== userId && interaction.user.id !== targetId) {
        return interaction.reply({ content: '❌ Không phải giao dịch của bạn!', ephemeral: true });
      }

      const isPlayer1 = interaction.user.id === userId;
      const offer = isPlayer1 ? session.offer1 : session.offer2;
      const playerData = isPlayer1 ? player : target;
      const pName = isPlayer1 ? message.author.username : message.mentions.users.first()!.username;

      switch (interaction.customId) {
        case 'trade_add_gold': {
          await interaction.reply({ content: 'Nhập số Gold muốn giao dịch (gõ số):', ephemeral: true });
          const filter = (m: any) => m.author.id === interaction.user.id;
          try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
            const amount = parseInt(collected.first()?.content || '0');
            if (isNaN(amount) || amount < 0) {
              break;
            }
            if (amount > playerData.stats.gold) {
              break;
            }
            offer.gold = amount;
            session.confirm1 = false;
            session.confirm2 = false;
            await interaction.followUp({ content: `Đã đặt ${amount} Gold.`, ephemeral: true });
          } catch { break; }
          break;
        }
        case 'trade_add_gem': {
          await interaction.reply({ content: 'Nhập số Gem muốn giao dịch (gõ số):', ephemeral: true });
          const filter = (m: any) => m.author.id === interaction.user.id;
          try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
            const amount = parseInt(collected.first()?.content || '0');
            if (isNaN(amount) || amount < 0) break;
            if (amount > playerData.gems) break;
            offer.gems = amount;
            session.confirm1 = false;
            session.confirm2 = false;
            await interaction.followUp({ content: `Đã đặt ${amount} Gem.`, ephemeral: true });
          } catch { break; }
          break;
        }
        case 'trade_confirm': {
          if (isPlayer1) session.confirm1 = true;
          else session.confirm2 = true;

          if (session.confirm1 && session.confirm2) {
            await executeTrade(session, db);
            cleanup(session);
            collector.stop();
            return;
          }
          break;
        }
        case 'trade_cancel': {
          session.message.edit({ content: '❌ Giao dịch đã bị hủy.', embeds: [], components: [] });
          cleanup(session);
          collector.stop();
          return;
        }
      }

      // Update embed
      const newEmbed = buildTradeEmbed(session, message.author.username, message.mentions.users.first()!.username);
      await interaction.message.edit({ embeds: [newEmbed] });
    });

    collector.on('end', (_: any, reason: any) => {
      if (reason === 'time') {
        const s = trades.get(tradeId);
        if (s) {
          s.message.edit({ content: '⏰ Giao dịch đã hết hạn!', embeds: [], components: [] });
          cleanup(s);
        }
      }
    });
  }
};
