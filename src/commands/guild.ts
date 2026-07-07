import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Database } from '../game/database';
import { GuildDB, Guild } from '../game/guildDB';

const guildDB = new GuildDB();

const GUILD_LEVEL_EXP: number[] = [
  0, 500, 1500, 3500, 7000, 12000, 20000, 32000, 50000, 80000,
];

function getGuildMaxMembers(level: number): number {
  return 10 + Math.floor(level / 2) * 2;
}

function getGuildLevel(exp: number): number {
  let level = 1;
  for (let i = 1; i < GUILD_LEVEL_EXP.length; i++) {
    if (exp >= GUILD_LEVEL_EXP[i]) level = i + 1;
    else break;
  }
  return Math.min(level, GUILD_LEVEL_EXP.length);
}

function getExpToNextGuildLevel(level: number): number {
  if (level >= GUILD_LEVEL_EXP.length) return Infinity;
  return GUILD_LEVEL_EXP[level];
}

export const prefixCommand = {
  name: 'guild',
  aliases: ['bang', 'clan'],
  description: 'Quản lý bang hội',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);
    if (!player) return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create`.');

    const sub = args[0]?.toLowerCase();
    const subArgs = args.slice(1);

    if (!sub) {
      const helpEmbed = new EmbedBuilder()
        .setTitle('⚔️ Hướng Dẫn Bang Hội')
        .setDescription('Quản lý bang hội của bạn!')
        .addFields(
          { name: '📋 Lệnh', value: [
            '`,guild create <tên>` - Tạo bang mới (1,000 Gold)',
            '`,guild join <tag>` - Vào bang',
            '`,guild leave` - Rời bang',
            '`,guild info` - Xem thông tin bang',
            '`,guild list` - Danh sách bang hội',
            '`,guild donate <sốGold>` - Đóng góp Gold (nhận EXP)',
            '`,guild promote <@user>` - Thăng chức thành phó bang',
            '`,guild kick <@user>` - Đuổi thành viên',
            '`,guild disband` - Giải tán bang',
          ].join('\n') },
          { name: '📈 Bang Hội', value: 'Đóng góp Gold → EXP → Level lên → mở khóa thêm thành viên (10 + level/2 × 2)' },
        )
        .setColor(0x5865F2);
      return message.reply({ embeds: [helpEmbed] });
    }

    // GUILD CREATE
    if (sub === 'create' || sub === 'tao') {
      const name = subArgs.join(' ');
      if (!name) return message.reply('❌ Dùng: `,guild create <tên bang>`');

      const existing = await guildDB.getGuildByMember(userId);
      if (existing) return message.reply(`❌ Bạn đã trong bang **${existing.name}** [${existing.tag}]!`);

      const tag = name.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (tag.length < 2) return message.reply('❌ Tên bang phải có ít nhất 2 ký tự chữ/số!');

      const existingTag = await guildDB.getGuildByTag(tag);
      if (existingTag) return message.reply(`❌ Tag **${tag}** đã tồn tại!`);

      if ((player.stats.gold || 0) < 1000) return message.reply('❌ Cần 1,000 Gold để tạo bang!');
      await db.addGold(player, -1000);

      const guild = await guildDB.createGuild(name, tag, userId);
      await db.updatePlayer(player);

      const embed = new EmbedBuilder()
        .setTitle('🏠 Tạo Bang Thành Công!')
        .setDescription(`**${guild.name}** [${guild.tag}]\nLeader: <@${guild.leaderId}>\nThành viên: ${guild.members.length}/${guild.maxMembers}`)
        .setColor(0x00FF00);

      return message.reply({ embeds: [embed] });
    }

    const guild = await guildDB.getGuildByMember(userId);

    // GUILD INFO
    if (!sub || sub === 'info' || sub === 'thongtin') {
      if (!guild) return message.reply('❌ Bạn chưa trong bang nào!');

      const expToNext = getExpToNextGuildLevel(guild.level);
      const progress = expToNext === Infinity ? 'MAX' : `${guild.exp}/${expToNext}`;

      let membersList = '';
      for (const m of guild.members) {
        const roleEmoji = m.role === 'leader' ? '👑' : m.role === 'officer' ? '⭐' : '👤';
        membersList += `${roleEmoji} <@${m.userId}> - Đã contribute: ${m.donated.toLocaleString()} gold\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle(`🏠 ${guild.name} [${guild.tag}]`)
        .setDescription(
          `**Level:** ${guild.level} (${progress})\n` +
          `**Gold:** ${guild.gold.toLocaleString()}\n` +
          `**Thành viên:** ${guild.members.length}/${guild.maxMembers}\n` +
          `**Leader:** <@${guild.leaderId}>`
        )
        .addFields({ name: '👥 Members', value: membersList || 'Không có', inline: false })
        .setColor(0xFFD700);

      return message.reply({ embeds: [embed] });
    }

    // GUILD JOIN
    if (sub === 'join' || sub === 'thamgia') {
      if (guild) return message.reply(`❌ Bạn đã trong bang **${guild.name}**!`);

      const guildName = subArgs.join(' ');
      if (!guildName) return message.reply('❌ Dùng: `,guild join <tên bang>`');

      const targetGuild = await guildDB.getGuildByName(guildName);
      if (!targetGuild) return message.reply('❌ Không tìm thấy bang!');

      if (targetGuild.members.length >= targetGuild.maxMembers) {
        return message.reply('❌ Bang đã đầy!');
      }

      targetGuild.members.push({ userId, role: 'member', joinedAt: Date.now(), donated: 0 });
      await guildDB.updateGuild(targetGuild);

      const embed = new EmbedBuilder()
        .setTitle('✅ Tham Gia Bang!')
        .setDescription(`Bạn đã gia nhập **${targetGuild.name}** [${targetGuild.tag}]!`)
        .setColor(0x00FF00);

      return message.reply({ embeds: [embed] });
    }

    if (!guild) return message.reply('❌ Bạn chưa trong bang nào! Dùng `,guild create` hoặc `,guild join <tên>`.');

    // GUILD LEAVE
    if (sub === 'leave' || sub === 'roi') {
      if (guild.leaderId === userId) return message.reply('❌ Leader không thể rời bang! Hãy chuyển leadership trước hoặc giải tán bang.');

      guild.members = guild.members.filter(m => m.userId !== userId);
      await guildDB.updateGuild(guild);

      return message.reply(`✅ Bạn đã rời khỏi **${guild.name}** [${guild.tag}].`);
    }

    // GUILD DONATE
    if (sub === 'donate' || sub === 'gop') {
      const amount = parseInt(subArgs[0]) || 100;
      if (amount < 10) return message.reply('❌ Tối thiểu contribute 10 Gold!');
      if ((player.stats.gold || 0) < amount) return message.reply(`❌ Không đủ Gold!Bạn có ${player.stats.gold}.`);

      await db.addGold(player, -amount);
      guild.gold += amount;
      guild.exp += Math.floor(amount / 10);

      const member = guild.members.find(m => m.userId === userId);
      if (member) member.donated += amount;

      const newLevel = getGuildLevel(guild.exp);
      const leveled = newLevel > guild.level;
      guild.level = newLevel;
      guild.maxMembers = getGuildMaxMembers(newLevel);

      await db.updatePlayer(player);
      await guildDB.updateGuild(guild);

      const embed = new EmbedBuilder()
        .setTitle('💰 Đóng Góp Thành Công!')
        .setDescription(
          `+${amount.toLocaleString()} Gold vào **${guild.name}**\n` +
          `Bang gold: ${guild.gold.toLocaleString()}\n` +
          `Bang EXP: ${guild.exp}` +
          (leveled ? `\n\n🎉 **BANG LEVEL UP! Level ${guild.level}!**` : '')
        )
        .setColor(0x00FF00);

      return message.reply({ embeds: [embed] });
    }

    // GUILD PROMOTE
    if (sub === 'promote' || sub === 'thangcap') {
      if (guild.leaderId !== userId) return message.reply('❌ Chỉ leader mới có quyền promote!');

      const target = message.mentions.users.first();
      if (!target) return message.reply('❌ Tag người cần promote!');

      const member = guild.members.find(m => m.userId === target.id);
      if (!member) return message.reply('❌ Người này không trong bang!');

      if (member.role === 'officer') return message.reply('❌ Đã là Officer rồi!');

      member.role = 'officer';
      await guildDB.updateGuild(guild);

      return message.reply(`✅ <@${target.id}> đã được promote thành **Officer** ⭐`);
    }

    // GUILD KICK
    if (sub === 'kick' || sub === 'day') {
      if (guild.leaderId !== userId) return message.reply('❌ Chỉ leader mới kick được!');

      const target = message.mentions.users.first();
      if (!target) return message.reply('❌ Tag người cần kick!');

      if (target.id === userId) return message.reply('❌ Không thể kick chính mình!');

      const member = guild.members.find(m => m.userId === target.id);
      if (!member) return message.reply('❌ Người này không trong bang!');

      guild.members = guild.members.filter(m => m.userId !== target.id);
      await guildDB.updateGuild(guild);

      return message.reply(`✅ <@${target.id}> đã bị kick khỏi bang.`);
    }

    // GUILD DISBAND
    if (sub === 'disband' || sub === 'giaitan') {
      if (guild.leaderId !== userId) return message.reply('❌ Chỉ leader mới giải tán bang!');

      await guildDB.deleteGuild(guild.id);
      return message.reply(`✅ Bang **${guild.name}** [${guild.tag}] đã bị giải tán.`);
    }

    // GUILD LIST
    if (sub === 'list' || sub === 'danhSach') {
      const allGuilds = await guildDB.getAllGuilds();
      if (allGuilds.length === 0) return message.reply('❌ Chưa có bang nào!');

      allGuilds.sort((a, b) => b.level - a.level || b.gold - a.gold);

      let list = '';
      allGuilds.slice(0, 15).forEach((g, i) => {
        list += `${i + 1}. **${g.name}** [${g.tag}] - Lv.${g.level} | ${g.members.length} members | 💰${g.gold.toLocaleString()}\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle('📋 Danh Sách Bang Hội')
        .setDescription(list)
        .setColor(0xFFD700);

      return message.reply({ embeds: [embed] });
    }

    // HELP
    const embed = new EmbedBuilder()
      .setTitle('🏠 Guild Commands')
      .addFields(
        { name: 'Tạo bang', value: ',`guild create <tên>` - 1,000 Gold', inline: false },
        { name: 'Tham gia', value: ',`guild join <tên bang>`', inline: false },
        { name: 'Rời bang', value: ',`guild leave`', inline: false },
        { name: 'Info', value: ',`guild info` hoặc ,`guild`', inline: false },
        { name: 'Đóng góp', value: ',`guild donate <số gold>` - +Bang EXP', inline: false },
        { name: 'Promote', value: ',`guild promote @user` - Leader only', inline: false },
        { name: 'Kick', value: ',`guild kick @user` - Leader only', inline: false },
        { name: 'Giải tán', value: ',`guild disband` - Leader only', inline: false },
        { name: 'Danh sách', value: ',`guild list`', inline: false },
      )
      .setColor(0xFFD700);

    message.reply({ embeds: [embed] });
  }
};
