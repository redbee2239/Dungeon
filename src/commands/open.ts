import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { isBeta, activateBeta, deactivateBeta } from '../game/beta';

const OWNER_ID = '1185140041022976083';

export const data = new SlashCommandBuilder()
  .setName('open')
  .setDescription('Beta feature toggle')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('action')
      .setDescription('Action')
      .setRequired(true)
      .addChoices(
        { name: 'beta 1.3 - Activate', value: 'beta' },
        { name: 'close - Deactivate', value: 'close' },
        { name: 'status - Check status', value: 'status' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '❌ Chỉ bot owner mới dùng được!', ephemeral: true });
  }

  const action = interaction.options.getString('action');

  if (action === 'beta') {
    activateBeta();
    const embed = new EmbedBuilder()
      .setTitle('🔓 Beta Đã Kích Hoạt')
      .setDescription('Các tính năng beta version 1.3 đã được bật.\n\n**Tính năng:**\n- 🛠️ Crafting\n- 💀 Class Necromancer\n- 🎲 Gacha Rework\n- 🔄 Trading\n- 📦 Nguyên liệu drops')
      .setColor(0x00FF00);
    return interaction.reply({ embeds: [embed] });
  }

  if (action === 'close') {
    deactivateBeta();
    const embed = new EmbedBuilder()
      .setTitle('🔒 Beta Đã Tắt')
      .setDescription('Các tính năng beta đã được tắt.')
      .setColor(0xFF0000);
    return interaction.reply({ embeds: [embed] });
  }

  const status = isBeta();
  const embed = new EmbedBuilder()
    .setTitle('📋 Trạng Thái Beta')
    .setDescription(`Beta 1.3: ${status ? '🟢 ĐANG BẬT' : '🔴 ĐÃ TẮT'}`)
    .setColor(status ? 0x00FF00 : 0xFF0000);
  return interaction.reply({ embeds: [embed] });
}
