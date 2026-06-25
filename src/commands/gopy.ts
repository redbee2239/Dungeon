import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Database } from '../game/database';

const OWNER_ID = '1185140041022976083';

export const data = new SlashCommandBuilder()
  .setName('gopy')
  .setDescription('Góp ý cho bot')
  .addStringOption(option =>
    option.setName('noidung')
      .setDescription('Nội dung góp ý')
      .setRequired(true)
  );

export const cooldown = 600;

export async function execute(interaction: ChatInputCommandInteraction, db: Database) {
  const suggestion = interaction.options.getString('noidung');

  if (!suggestion) {
    return interaction.reply({
      content: '❌ Vui lòng nhập nội dung góp ý!',
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('📩 Góp Ý Mới')
    .setDescription(suggestion)
    .addFields(
      { name: '👤 Từ', value: `${interaction.user.username} (${interaction.user.id})`, inline: true },
      { name: '📍 Server', value: interaction.guild?.name || 'DM', inline: true }
    )
    .setColor(0x0099FF)
    .setTimestamp();

  try {
    const owner = await interaction.client.users.fetch(OWNER_ID);
    await owner.send({ embeds: [embed] });
  } catch (e) {
    console.error('Không thể gửi DM cho owner:', e);
  }

  await interaction.reply({
    content: '✅ Đã gửi góp ý thành công! Cảm ơn bạn.',
    ephemeral: true
  });
}
