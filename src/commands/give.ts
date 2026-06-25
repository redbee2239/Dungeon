import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Database } from '../game/database';

const OWNER_ID = '1185140041022976083';

export const data = new SlashCommandBuilder()
  .setName('give')
  .setDescription('Admin: Give gem/money to user')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User nhận')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Loại')
      .setRequired(true)
      .addChoices(
        { name: '💎 Gem', value: 'gem' },
        { name: '💰 Gold', value: 'gold' }
      )
  )
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Số lượng')
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction, db: Database) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({
      content: '❌ Bạn không có quyền sử dụng lệnh này!',
      ephemeral: true
    });
  }

  const targetUser = interaction.options.getUser('user');
  const type = interaction.options.getString('type');
  const amount = interaction.options.getInteger('amount');

  if (!targetUser || !type || !amount) {
    return interaction.reply({
      content: '❌ Thiếu tham số!',
      ephemeral: true
    });
  }

  const player = await db.getPlayer(targetUser.id);
  if (!player) {
    return interaction.reply({
      content: `❌ ${targetUser.username} chưa có nhân vật!`,
      ephemeral: true
    });
  }

  if (type === 'gem') {
    await db.addGems(player, amount);
  } else {
    await db.addGold(player, amount);
  }

  const embed = new EmbedBuilder()
    .setTitle('✅ Give Thành Công!')
    .setDescription(
      `Đã cho **${targetUser.username}**:\n` +
      `${type === 'gem' ? '💎' : '💰'} ${amount} ${type === 'gem' ? 'Gem' : 'Gold'}`
    )
    .setColor(0x00FF00);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
