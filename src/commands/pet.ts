import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { PETS, PET_RARITY_NAMES, PET_RARITY_COLORS, PET_GACHA_COST, rollPetWithPity, Pet, PetRarity } from '../game/pets';

const RARITY_EMOJI: Record<PetRarity, string> = {
  common: '⚪',
  uncommon: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟠'
};

function getBonusText(pet: Pet): string {
  const b = pet.bonus;
  const parts: string[] = [];
  if (b.attack) parts.push(`⚔️ ATK +${b.attack}`);
  if (b.defense) parts.push(`🛡️ DEF +${b.defense}`);
  if (b.hp) parts.push(`❤️ HP +${b.hp}`);
  if (b.mp) parts.push(`💧 MP +${b.mp}`);
  if (b.speed) parts.push(`💨 SPD +${b.speed}`);
  if (b.crit) parts.push(`💥 Crit +${b.crit}%`);
  if (b.summonBoost) parts.push(`📛 Summon +${b.summonBoost}%`);
  return parts.join(' | ') || 'Không có bonus';
}

export const prefixCommand = {
  name: 'pet',
  aliases: ['petgacha', 'gachapet'],
  description: 'Gacha pet hoặc quản lý pet',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);

    if (!player) {
      return message.reply('❌ Bạn chưa tạo nhân vật! Dùng `,create` để bắt đầu.');
    }

    const action = args[0]?.toLowerCase();

    if (action === 'list' || action === 'xem' || action === 'all') {
      return showPetList(message, player);
    }

    if (action === 'equip' || action === 'mang') {
      return showEquipMenu(message, player, db);
    }

    if (action === 'info' || action === 'detail') {
      return showEquippedInfo(message, player);
    }

    if (player.gems < PET_GACHA_COST) {
      return message.reply(`❌ Không đủ Gem! Cần **${PET_GACHA_COST}** Gem (Bạn có **${player.gems}**).`);
    }

    const result = rollPetWithPity(player.petGachaPity);
    const pet = result.pet;
    player.petGachaPity = result.newPity;
    player.gems -= PET_GACHA_COST;

    const existing = player.ownedPets.find(p => p.petId === pet.id);
    let isNew = false;
    if (existing) {
      existing.quantity++;
    } else {
      player.ownedPets.push({ petId: pet.id, quantity: 1 });
      isNew = true;
    }

    await db.updatePlayer(player);

    const embed = new EmbedBuilder()
      .setTitle(`${isNew ? '🆕' : '📦'} Gacha Pet!`)
      .setDescription(
        `${pet.emoji} **${pet.name}**\n` +
        `${RARITY_EMOJI[pet.rarity]} ${PET_RARITY_NAMES[pet.rarity]}\n` +
        `${pet.description}\n\n` +
        `${getBonusText(pet)}` +
        (isNew ? '\n\n🎉 **PET MỚI!**' : `\n\nĐã có: **${existing?.quantity || 1}**`) +
        `\n\n💎 Còn lại: **${player.gems}** Gem`
      )
      .setColor(PET_RARITY_COLORS[pet.rarity]);

    message.reply({ embeds: [embed] });
  }
};

function showPetList(message: any, player: any) {
  if (player.ownedPets.length === 0) {
    return message.reply('📭 Bạn chưa có pet nào! Dùng `,pet` để gacha.');
  }

  const embed = new EmbedBuilder()
    .setTitle('🐾 Danh Sách Pet')
    .setDescription(`Tổng: **${player.ownedPets.length}** loại pet`)
    .setColor(0xFFD700);

  for (const owned of player.ownedPets) {
    const pet = PETS.find(p => p.id === owned.petId);
    if (!pet) continue;
    const equipped = player.equippedPet === pet.id ? ' [ĐANG MANG]' : '';
    embed.addFields({
      name: `${pet.emoji} ${pet.name}${equipped}`,
      value: `${RARITY_EMOJI[pet.rarity]} ${PET_RARITY_NAMES[pet.rarity]} | SL: ${owned.quantity}\n${getBonusText(pet)}`,
      inline: true
    });
  }

  message.reply({ embeds: [embed] });
}

function showEquippedInfo(message: any, player: any) {
  if (!player.equippedPet) {
    return message.reply('❌ Bạn chưa mang pet nào! Dùng `,pet equip` để chọn.');
  }

  const pet = PETS.find(p => p.id === player.equippedPet);
  if (!pet) return message.reply('❌ Pet không tồn tại!');

  const embed = new EmbedBuilder()
    .setTitle(`${pet.emoji} Pet Đang Mang`)
    .setDescription(
      `**${pet.name}**\n` +
      `${RARITY_EMOJI[pet.rarity]} ${PET_RARITY_NAMES[pet.rarity]}\n` +
      `${pet.description}\n\n` +
      `${getBonusText(pet)}`
    )
    .setColor(PET_RARITY_COLORS[pet.rarity]);

  message.reply({ embeds: [embed] });
}

async function showEquipMenu(message: any, player: any, db: Database) {
  if (player.ownedPets.length === 0) {
    return message.reply('📭 Bạn chưa có pet nào! Dùng `,pet` để gacha.');
  }

  const embed = new EmbedBuilder()
    .setTitle('🎯 Chọn Pet Để Mang')
    .setDescription('Chọn pet từ dropdown bên dưới.')
    .setColor(0xFFD700);

  if (player.equippedPet) {
    const current = PETS.find(p => p.id === player.equippedPet);
    if (current) {
      embed.addFields({ name: 'Đang mang', value: `${current.emoji} **${current.name}**`, inline: false });
    }
  }

  const row = new ActionRowBuilder<StringSelectMenuBuilder>();
  row.addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('pet_equip_select')
      .setPlaceholder('Chọn pet...')
      .addOptions(
        player.ownedPets.slice(0, 25).map((owned: any) => {
          const pet = PETS.find(p => p.id === owned.petId);
          if (!pet) return null;
          return {
            label: `${pet.emoji} ${pet.name}`,
            description: `${RARITY_EMOJI[pet.rarity]} ${PET_RARITY_NAMES[pet.rarity]} | SL: ${owned.quantity}`.substring(0, 100),
            value: pet.id
          };
        }).filter(Boolean) as any[]
      )
  );

  const unequipRow = new ActionRowBuilder<ButtonBuilder>();
  unequipRow.addComponents(
    new ButtonBuilder().setCustomId('pet_unequip').setLabel('🚫 Tháo Pet').setStyle(ButtonStyle.Secondary)
  );

  const reply = await message.reply({ embeds: [embed], components: [row, unequipRow] });

  const collector = reply.createMessageComponentCollector({
    time: 30000,
    max: 1
  });

  collector.on('collect', async (i: any) => {
    if (i.user.id !== message.author.id) {
      return i.reply({ content: '❌ Không phải menu của bạn!', ephemeral: true });
    }

    if (i.customId === 'pet_unequip') {
      player.equippedPet = null;
      await db.updatePlayer(player);
      await i.update({ content: '🚫 Đã tháo pet!', embeds: [], components: [] });
      return;
    }

    if (i.customId === 'pet_equip_select') {
      const petId = i.values[0];
      const pet = PETS.find(p => p.id === petId);
      if (!pet) return;

      player.equippedPet = petId;
      await db.updatePlayer(player);

      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Đãequip Pet!')
        .setDescription(`${pet.emoji} **${pet.name}**\n${getBonusText(pet)}`)
        .setColor(PET_RARITY_COLORS[pet.rarity]);

      await i.update({ embeds: [successEmbed], components: [] });
    }
  });

  collector.on('end', async (collected: any) => {
    if (collected.size === 0) {
      await reply.edit({ components: [] }).catch(() => {});
    }
  });
}
