import { EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';
import {
  loadAdminConfig, getAdminConfig, toggleSystem, isSystemEnabled,
  toggleCommand, isCommandDisabled, banUser, unbanUser, isUserBanned,
  getStats, isPaused, setPaused
} from '../game/adminState';
import { ITEMS } from '../game/items';
import { addItem } from '../game/inventory';
import { spawnWorldBoss, despawnWorldBoss, getCurrentBoss } from '../game/worldBoss';
import { clearCooldown } from '../utils/cooldown';
import { activateBeta, deactivateBeta } from '../game/beta';

const OWNER_ID = '1185140041022976083';

function isAdminChannel(message: any): boolean {
  const adminChannelId = process.env.ADMIN_CHANNEL_ID?.trim();
  if (!adminChannelId) return false;
  return message.channel.id === adminChannelId;
}

function isOwner(message: any): boolean {
  return message.author.id === OWNER_ID;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function mentionToId(text: string): string | null {
  const match = text.match(/^<@!?(\d+)>$/);
  return match ? match[1] : null;
}

export const prefixCommand = {
  name: 'admin',
  description: 'Admin console - Quản lý bot',
  execute: async (message: any, args: string[], db: Database) => {
    if (!isAdminChannel(message)) return;
    if (!isOwner(message)) {
      return message.reply('❌ Chỉ bot owner mới sử dụng được!');
    }

    const sub = args[0]?.toLowerCase();

    // ─── HELP ───
    if (!sub || sub === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('🛠️ Admin Console')
        .setColor(0xFF4500)
        .setDescription(
          '**Hệ thống:**\n' +
          '`,admin pause` — Tạm dừng bot (chỉ admin dùng được)\n' +
          '`,admin resume` — Tiếp tục bot\n' +
          '`,admin toggle <system>` — Bật/tắt hệ thống\n' +
          '`,admin systems` — Xem trạng thái hệ thống\n\n' +
          '**Lệnh:**\n' +
          '`,admin cmd disable <tên>` — Tắt lệnh\n' +
          '`,admin cmd enable <tên>` — Bật lệnh\n' +
          '`,admin cmd list` — Danh sách lệnh bị tắt\n\n' +
          '**Player:**\n' +
          '`,admin player info <@user>` — Xem thông tin\n' +
          '`,admin player give <@user> gold|gems <số>` — Cho资源\n' +
          '`,admin player give <@user> item <item_id> [số]` — Cho item\n' +
          '`,admin player reset <@user>` — Reset nhân vật\n' +
          '`,admin player ban <@user>` — Chặn lệnh\n' +
          '`,admin player unban <@user>` — Bỏ chặn\n\n' +
          '**Boss:**\n' +
          '`,admin boss spawn` — Spawn world boss\n' +
          '`,admin boss kill` — Kill boss hiện tại\n\n' +
          '**Khác:**\n' +
          '`,admin stats` — Thống kê\n' +
          '`,admin cooldown <@user>` — Xóa cooldown\n' +
          '`,admin broadcast <tin nhắn>` — Gửi tin nhắn'
        );
      return message.reply({ embeds: [embed] });
    }

    // ─── PAUSE / RESUME ───
    if (sub === 'pause') {
      await setPaused(true);
      return message.reply('⏸️ Bot đã **tạm dừng**. Dùng `,admin resume` để tiếp tục.');
    }
    if (sub === 'resume') {
      await setPaused(false);
      return message.reply('▶️ Bot đã **tiếp tục** hoạt động.');
    }

    // ─── SYSTEMS ───
    if (sub === 'systems' || sub === 'sys') {
      const config = getAdminConfig();
      const systems = config.systems as Record<string, boolean>;
      const lines = Object.entries(systems).map(([k, v]) =>
        `${v ? '🟢' : '🔴'} **${k}** — ${v ? 'Bật' : 'Tắt'}`
      );
      const embed = new EmbedBuilder()
        .setTitle('⚙️ Trạng thái hệ thống')
        .setDescription(lines.join('\n'))
        .setColor(0x3498DB);
      return message.reply({ embeds: [embed] });
    }

    if (sub === 'toggle') {
      const systemName = args[1]?.toLowerCase();
      const validSystems = ['beta', 'event', 'worldboss', 'crafting', 'gacha', 'cooldown'];
      if (!systemName || !validSystems.includes(systemName)) {
        return message.reply(`❌ Hệ thống hợp lệ: ${validSystems.join(', ')}`);
      }
      const newValue = await toggleSystem(systemName);
      // Sync beta state
      if (systemName === 'beta') {
        newValue ? activateBeta() : deactivateBeta();
      }
      return message.reply(`${newValue ? '🟢' : '🔴'} **${systemName}** → ${newValue ? 'Bật' : 'Tắt'}`);
    }

    // ─── COMMAND MANAGEMENT ───
    if (sub === 'cmd') {
      const action = args[1]?.toLowerCase();
      const cmdName = args[2]?.toLowerCase();

      if (action === 'list') {
        const config = getAdminConfig();
        if (config.disabledCommands.length === 0) {
          return message.reply('✅ Không có lệnh nào bị tắt.');
        }
        const embed = new EmbedBuilder()
          .setTitle('🚫 Lệnh bị tắt')
          .setDescription(config.disabledCommands.map(c => `\`${c}\``).join(', '))
          .setColor(0xFF0000);
        return message.reply({ embeds: [embed] });
      }

      if (action === 'disable') {
        if (!cmdName) return message.reply('❌ Thiếu tên lệnh: `,admin cmd disable <tên>`');
        if (isCommandDisabled(cmdName)) return message.reply(`⚠️ Lệnh \`${cmdName}\` đã bị tắt.`);
        await toggleCommand(cmdName);
        return message.reply(`🔴 Đã tắt lệnh \`${cmdName}\``);
      }

      if (action === 'enable') {
        if (!cmdName) return message.reply('❌ Thiếu tên lệnh: `,admin cmd enable <tên>`');
        if (!isCommandDisabled(cmdName)) return message.reply(`⚠️ Lệnh \`${cmdName}\` đã đang bật.`);
        await toggleCommand(cmdName);
        return message.reply(`🟢 Đã bật lệnh \`${cmdName}\``);
      }

      return message.reply('❌ Usage: `,admin cmd <disable|enable|list> [tên]`');
    }

    // ─── PLAYER MANAGEMENT ───
    if (sub === 'player') {
      const action = args[1]?.toLowerCase();
      const targetMention = args[2];
      const targetId = targetMention ? mentionToId(targetMention) : null;

      if (!targetId) return message.reply('❌ Tag người chơi: `,admin player <info|give|reset|ban|unban> <@user> ...`');

      if (action === 'info') {
        const player = await db.getPlayer(targetId);
        if (!player) return message.reply('❌ Người chơi chưa tạo nhân vật.');
        const embed = new EmbedBuilder()
          .setTitle(`📋 ${player.name}`)
          .setColor(0x3498DB)
          .addFields(
            { name: 'Class', value: player.characterClass, inline: true },
            { name: 'Level', value: `${player.stats.level}`, inline: true },
            { name: 'HP', value: `${player.stats.hp}/${player.stats.maxHP}`, inline: true },
            { name: 'MP', value: `${player.stats.mp}/${player.stats.maxMP}`, inline: true },
            { name: 'ATK', value: `${player.stats.attack}`, inline: true },
            { name: 'DEF', value: `${player.stats.defense}`, inline: true },
            { name: 'SPD', value: `${player.stats.speed}`, inline: true },
            { name: '💰 Gold', value: `${player.stats.gold.toLocaleString()}`, inline: true },
            { name: '💎 Gem', value: `${player.gems.toLocaleString()}`, inline: true },
            { name: 'Floor', value: `${player.highestFloor}`, inline: true },
            { name: 'Kills', value: `${player.totalMonstersKilled}`, inline: true },
            { name: 'Banned', value: isUserBanned(targetId) ? '🔴 Yes' : '🟢 No', inline: true }
          );
        return message.reply({ embeds: [embed] });
      }

      if (action === 'give') {
        const player = await db.getPlayer(targetId);
        if (!player) return message.reply('❌ Người chơi chưa tạo nhân vật.');

        const type = args[3]?.toLowerCase();
        const amount = parseInt(args[4] || '0');

        if (type === 'gold') {
          if (!amount || amount <= 0) return message.reply('❌ Số lượng không hợp lệ.');
          await db.addGold(player, amount);
          return message.reply(`✅ Đã cho **${player.name}** 💰 ${amount.toLocaleString()} gold`);
        }
        if (type === 'gems' || type === 'gem') {
          if (!amount || amount <= 0) return message.reply('❌ Số lượng không hợp lệ.');
          await db.addGems(player, amount);
          return message.reply(`✅ Đã cho **${player.name}** 💎 ${amount.toLocaleString()} gems`);
        }
        if (type === 'item') {
          const itemId = args[4]?.toLowerCase();
          const qty = parseInt(args[5] || '1');
          if (!itemId || !ITEMS[itemId]) {
            const itemList = Object.keys(ITEMS).slice(0, 20).join(', ');
            return message.reply(`❌ Item không tồn tại. Ví dụ: \`${itemId || '...'}\`\nMột số item: ${itemList}...`);
          }
          const item = ITEMS[itemId];
          const result = addItem(player.inventory, item, qty);
          if (!result.success) return message.reply(`❌ ${result.message}`);
          await db.updatePlayer(player);
          return message.reply(`✅ Đã cho **${player.name}** ${item.emoji} ${item.name} x${qty}`);
        }

        return message.reply('❌ Usage: `,admin player give <@user> gold|gems|item <giá trị>`');
      }

      if (action === 'reset') {
        const player = await db.getPlayer(targetId);
        if (!player) return message.reply('❌ Người chơi chưa tạo nhân vật.');
        const name = player.name;
        const { PlayerModel } = require('../game/playerModel');
        await PlayerModel.findOneAndDelete({ userId: targetId });
        return message.reply(`✅ Đã reset nhân vật **${name}** (ID: ${targetId})`);
      }

      if (action === 'ban') {
        if (isUserBanned(targetId)) return message.reply('⚠️ User này đã bị ban.');
        await banUser(targetId);
        return message.reply(`🔴 Đã ban user **${targetId}** — không thể dùng lệnh.`);
      }

      if (action === 'unban') {
        if (!isUserBanned(targetId)) return message.reply('⚠️ User này chưa bị ban.');
        await unbanUser(targetId);
        return message.reply(`🟢 Đã unban user **${targetId}**`);
      }

      return message.reply('❌ Usage: `,admin player <info|give|reset|ban|unban> <@user> ...`');
    }

    // ─── BOSS ───
    if (sub === 'boss') {
      const action = args[1]?.toLowerCase();
      if (action === 'spawn') {
        const boss = spawnWorldBoss();
        return message.reply(`${boss.emoji} **${boss.name}** đã xuất hiện!\nHP: ${boss.maxHP.toLocaleString()}`);
      }
      if (action === 'kill') {
        const boss = getCurrentBoss();
        if (!boss) return message.reply('❌ Không có boss nào đang active.');
        despawnWorldBoss();
        return message.reply(`✅ Đã kill **${boss.name}**.`);
      }
      return message.reply('❌ Usage: `,admin boss <spawn|kill>`');
    }

    // ─── STATS ───
    if (sub === 'stats') {
      const stats = getStats();
      const allPlayers = await db.getAllPlayers();
      const embed = new EmbedBuilder()
        .setTitle('📊 Thống kê Bot')
        .setColor(0x2ECC71)
        .addFields(
          { name: 'Uptime', value: formatUptime(stats.uptime), inline: true },
          { name: 'Players', value: `${allPlayers.length}`, inline: true },
          { name: 'Tổng lệnh', value: `${stats.totalCommands}`, inline: true },
          { name: 'Messages', value: `${stats.messagesProcessed}`, inline: true },
          { name: 'Errors', value: `${stats.errors}`, inline: true }
        );
      if (stats.commandUses.length > 0) {
        const topCmds = stats.commandUses.map(([cmd, count]) => `\`${cmd}\`: ${count}`).join('\n');
        embed.addFields({ name: 'Top Commands', value: topCmds });
      }
      return message.reply({ embeds: [embed] });
    }

    // ─── COOLDOWN ───
    if (sub === 'cooldown') {
      const targetId = mentionToId(args[1] || '');
      if (!targetId) return message.reply('❌ Tag người chơi: `,admin cooldown <@user>`');
      clearCooldown(targetId);
      return message.reply(`✅ Đã xóa cooldown của **${targetId}**`);
    }

    // ─── BROADCAST ───
    if (sub === 'broadcast') {
      const text = args.slice(1).join(' ');
      if (!text) return message.reply('❌ Thiếu nội dung: `,admin broadcast <tin nhắn>`');
      const embed = new EmbedBuilder()
        .setTitle('📢 Thông báo từ Admin')
        .setDescription(text)
        .setColor(0xFF4500)
        .setTimestamp();

      const channels = message.client.channels.cache;
      let sent = 0;
      for (const [, ch] of channels) {
        if (ch.isTextBased() && !ch.isDMBased()) {
          try {
            await ch.send({ embeds: [embed] });
            sent++;
          } catch {}
        }
      }
      return message.reply(`✅ Đã broadcast đến **${sent}** channel.`);
    }

    return message.reply('❌ Lệnh không hợp lệ. Dùng `,admin help` để xem danh sách.');
  }
};
