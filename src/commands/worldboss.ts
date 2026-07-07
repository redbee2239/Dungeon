import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Database } from '../game/database';
import { GuildDB } from '../game/guildDB';
import {
  getCurrentBoss, spawnWorldBoss, attackWorldBoss,
  getTopDamageDealers, despawnWorldBoss, getBossRewards
} from '../game/worldBoss';

const guildDB = new GuildDB();

export const prefixCommand = {
  name: 'worldboss',
  aliases: ['wb', 'raid'],
  description: 'Tham gia World Boss',
  execute: async (message: any, args: string[], db: Database) => {
    const userId = message.author.id;
    const player = await db.getPlayer(userId);
    if (!player) return message.reply('❌ Bạn chưa có nhân vật! Dùng `,create`.');

    const sub = args[0]?.toLowerCase();

    // WB SPAWN (admin only - hoặc tự spawn khi hết cooldown)
    if (sub === 'spawn') {
      const boss = spawnWorldBoss();
      return sendBossSpawn(message, boss);
    }

    let boss = getCurrentBoss();

    // Auto spawn check
    if (!boss || !boss.active) {
      boss = spawnWorldBoss();
      await sendBossSpawn(message, boss);
    }

    boss = getCurrentBoss();
    if (!boss || !boss.active) {
      return message.reply('❌ World Boss chưa xuất hiện! Thử lại sau.');
    }

    // WB INFO
    if (sub === 'info' || sub === 'top') {
      const top = getTopDamageDealers();
      let topList = '';
      for (let i = 0; i < Math.min(top.length, 10); i++) {
        const entry = top[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        topList += `${medal} <@${entry.userId}> - **${entry.damage.toLocaleString()}** dmg\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${boss.emoji} ${boss.name} - Info`)
        .setDescription(
          `HP: **${boss.hp.toLocaleString()}**/${boss.maxHP.toLocaleString()}\n` +
          `ATK: ${boss.attack} | DEF: ${boss.defense}\n` +
          `Tham gia: ${boss.participants.size} người`
        )
        .addFields(
          { name: '🏆 Top Damage', value: topList || 'Chưa ai tấn công', inline: false },
          { name: '🎁 Phần Thưởng', value: `💰 ${boss.rewards.gold.toLocaleString()} Gold | 💎 ${boss.rewards.gems} Gem | 🪙 ${boss.rewards.summerCoins} Summer Coin`, inline: false }
        )
        .setColor(0xFF0000);

      return message.reply({ embeds: [embed] });
    }

    // WB ATTACK
    const result = attackWorldBoss(player);
    await db.updatePlayer(player);

    if (result.killed) {
      const top = getTopDamageDealers();
      const rewards = getBossRewards();
      let rewardMsg = '🎉 **WORLD BOSS ĐÃ BỊ ĐÁNH BẠI!**\n\n';

      if (rewards) {
        for (const entry of top) {
          const p = await db.getPlayer(entry.userId);
          if (p) {
            const share = Math.floor(rewards.gold * (entry.damage / boss.maxHP));
            const gemShare = Math.floor(rewards.gems * (entry.damage / boss.maxHP));
            const coinShare = Math.floor(rewards.summerCoins * (entry.damage / boss.maxHP));
            await db.addGold(p, Math.max(100, share));
            await db.addGems(p, Math.max(5, gemShare));
            p.summerCoins = (p.summerCoins || 0) + Math.max(5, coinShare);
            await db.updatePlayer(p);
          }
        }
        rewardMsg += '**Phần thưởng theo damage:**\n';
        for (const entry of top.slice(0, 5)) {
          const share = Math.floor(rewards.gold * (entry.damage / boss.maxHP));
          rewardMsg += `<@${entry.userId}>: **${entry.damage.toLocaleString()}** dmg → 💰${Math.max(100, share).toLocaleString()}\n`;
        }
      }
      despawnWorldBoss();
      const embed = new EmbedBuilder().setTitle('💀 World Boss Defeated!').setDescription(rewardMsg).setColor(0x00FF00);
      return message.reply({ embeds: [embed] });
    }

    const hpPercent = Math.floor((boss.hp / boss.maxHP) * 100);
    const bar = hpBar(hpPercent);
    const playerDead = result.playerDied;

    const embed = new EmbedBuilder()
      .setTitle(`${boss.emoji} ${boss.name}`)
      .setDescription(
        result.message + '\n\n' +
        `${bar} **${hpPercent}%**\n` +
        `Tham gia: ${boss.participants.size} người`
      )
      .setColor(playerDead ? 0x808080 : hpPercent > 50 ? 0xFF0000 : hpPercent > 20 ? 0xFFAA00 : 0x00FF00);

    const row = new ActionRowBuilder<ButtonBuilder>();
    if (playerDead) {
      row.addComponents(
        new ButtonBuilder().setCustomId('wb_attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger).setDisabled(true),
        new ButtonBuilder().setCustomId('wb_heal').setLabel('🩹 Hồi Sinh').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('wb_info').setLabel('📊 Info').setStyle(ButtonStyle.Secondary),
      );
    } else {
      row.addComponents(
        new ButtonBuilder().setCustomId('wb_attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('wb_info').setLabel('📊 Info').setStyle(ButtonStyle.Secondary),
      );
    }

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on('collect', async (i: any) => {
      if (i.user.id !== userId) {
        return i.reply({ content: '❌ Không phải lượt của bạn!', ephemeral: true });
      }

      if (i.customId === 'wb_heal') {
        const p = await db.getPlayer(userId);
        if (!p) return i.reply({ content: '❌ Lỗi!', ephemeral: true });

        const { calculateBonusStats } = await import('../game/inventory');
        const bonus = calculateBonusStats(p.inventory, p.equippedPet);
        const maxHp = p.stats.maxHP + bonus.hp;

        // Try auto heal with potions
        const hpPotion = p.inventory.items.find((inv: any) => inv.itemId === 'health_potion' && inv.quantity > 0);
        const megaPotion = p.inventory.items.find((inv: any) => inv.itemId === 'mega_health' && inv.quantity > 0);
        const elixir = p.inventory.items.find((inv: any) => inv.itemId === 'elixir' && inv.quantity > 0);

        let healed = false;
        let healMsg = '';

        if (elixir) {
          const { removeItem } = await import('../game/inventory');
          const { ITEMS } = await import('../game/items');
          removeItem(p.inventory, 'elixir', 1);
          p.stats.hp = Math.min(maxHp, p.stats.hp + 200);
          p.stats.mp = Math.min(p.stats.maxMP + bonus.mp, p.stats.mp + 100);
          healed = true;
          healMsg = '🧪 Dùng Elixir → HP +200, MP +100';
        } else if (megaPotion) {
          const { removeItem } = await import('../game/inventory');
          removeItem(p.inventory, 'mega_health', 1);
          p.stats.hp = Math.min(maxHp, p.stats.hp + 300);
          healed = true;
          healMsg = '💖 Dùng Mega Health → HP +300';
        } else if (hpPotion) {
          const { removeItem } = await import('../game/inventory');
          removeItem(p.inventory, 'health_potion', 1);
          p.stats.hp = Math.min(maxHp, p.stats.hp + 100);
          healed = true;
          healMsg = '❤️ Dùng Health Potion → HP +100';
        } else {
          // No potions - partial heal
          p.stats.hp = Math.floor(maxHp * 0.3);
          healMsg = `⚠️ Không có thuốc! Hồi phục 30% HP (${p.stats.hp}/${maxHp})`;
          healed = true;
        }

        await db.updatePlayer(p);

        const bonus2 = calculateBonusStats(p.inventory, p.equippedPet);
        const maxHp2 = p.stats.maxHP + bonus2.hp;

        const healedEmbed = new EmbedBuilder()
          .setTitle(`${boss!.emoji} ${boss!.name}`)
          .setDescription(
            `${healMsg}\n\n` +
            `HP: ${p.stats.hp.toLocaleString()}/${maxHp2.toLocaleString()}\n\n` +
            `${hpBar(Math.floor(boss!.hp / boss!.maxHP * 100))} **${Math.floor(boss!.hp / boss!.maxHP * 100)}%**\n` +
            `Tham gia: ${boss!.participants.size} người`
          )
          .setColor(0x00FF00);

        const attackRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('wb_attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('wb_info').setLabel('📊 Info').setStyle(ButtonStyle.Secondary),
        );

        return i.update({ embeds: [healedEmbed], components: [attackRow] });
      }

      if (i.customId === 'wb_attack') {
        const p = await db.getPlayer(userId);
        if (!p) return i.reply({ content: '❌ Lỗi!', ephemeral: true });

        if (p.stats.hp <= 0) {
          return i.reply({ content: '❌ Bạn đang chết! Dùng 🩹 Hồi Sinh trước.', ephemeral: true });
        }

        const atkResult = attackWorldBoss(p);
        await db.updatePlayer(p);

        if (atkResult.killed) {
          const top = getTopDamageDealers();
          const rewards = getBossRewards();
          let rewardMsg = '🎉 **WORLD BOSS ĐÃ BỊ ĐÁNH BẠI!**\n\n';

          if (rewards) {
            for (const entry of top) {
              const playerData = await db.getPlayer(entry.userId);
              if (playerData) {
                const share = Math.floor(rewards.gold * (entry.damage / boss!.maxHP));
                const gemShare = Math.floor(rewards.gems * (entry.damage / boss!.maxHP));
                const coinShare = Math.floor(rewards.summerCoins * (entry.damage / boss!.maxHP));
                await db.addGold(playerData, Math.max(100, share));
                await db.addGems(playerData, Math.max(5, gemShare));
                playerData.summerCoins = (playerData.summerCoins || 0) + Math.max(5, coinShare);
                await db.updatePlayer(playerData);
              }
            }
            rewardMsg += '**Phần thưởng theo damage:**\n';
            for (const entry of top.slice(0, 5)) {
              const share = Math.floor(rewards.gold * (entry.damage / boss!.maxHP));
              rewardMsg += `<@${entry.userId}>: **${entry.damage.toLocaleString()}** dmg → 💰${Math.max(100, share).toLocaleString()}\n`;
            }
          }
          despawnWorldBoss();
          const finalEmbed = new EmbedBuilder().setTitle('💀 World Boss Defeated!').setDescription(rewardMsg).setColor(0x00FF00);
          return i.update({ embeds: [finalEmbed], components: [] });
        }

        const newHpPercent = Math.floor((boss!.hp / boss!.maxHP) * 100);
        const bar = hpBar(newHpPercent);
        const isDead = atkResult.playerDied;

        const atkEmbed = new EmbedBuilder()
          .setTitle(`${boss!.emoji} ${boss!.name}`)
          .setDescription(
            atkResult.message + '\n\n' +
            `${bar} **${newHpPercent}%**\n` +
            `Tham gia: ${boss!.participants.size} người`
          )
          .setColor(isDead ? 0x808080 : newHpPercent > 50 ? 0xFF0000 : newHpPercent > 20 ? 0xFFAA00 : 0x00FF00);

        const atkRow = new ActionRowBuilder<ButtonBuilder>();
        if (isDead) {
          atkRow.addComponents(
            new ButtonBuilder().setCustomId('wb_attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger).setDisabled(true),
            new ButtonBuilder().setCustomId('wb_heal').setLabel('🩹 Hồi Sinh').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('wb_info').setLabel('📊 Info').setStyle(ButtonStyle.Secondary),
          );
        } else {
          atkRow.addComponents(
            new ButtonBuilder().setCustomId('wb_attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('wb_info').setLabel('📊 Info').setStyle(ButtonStyle.Secondary),
          );
        }

        return i.update({ embeds: [atkEmbed], components: [atkRow] });
      }

      if (i.customId === 'wb_info') {
        const top = getTopDamageDealers();
        let topList = '';
        for (let j = 0; j < Math.min(top.length, 5); j++) {
          const entry = top[j];
          const medal = j === 0 ? '🥇' : j === 1 ? '🥈' : j === 2 ? '🥉' : `${j + 1}.`;
          topList += `${medal} <@${entry.userId}> - **${entry.damage.toLocaleString()}** dmg\n`;
        }
        const infoEmbed = new EmbedBuilder()
          .setTitle(`${boss!.emoji} ${boss!.name} - Top Damage`)
          .setDescription(topList || 'Chưa ai tấn công')
          .setColor(0xFFD700);
        return i.reply({ embeds: [infoEmbed], ephemeral: true });
      }
    });
  }
};

function hpBar(percent: number): string {
  const filled = Math.floor(percent / 10);
  const empty = 10 - filled;
  return '🟥'.repeat(filled) + '⬛'.repeat(empty);
}

async function sendBossSpawn(message: any, boss: any) {
  const embed = new EmbedBuilder()
    .setTitle(`⚠️ ${boss.emoji} ${boss.name} ĐÃ XUẤT HIỆN!`)
    .setDescription(
      `**HP:** ${boss.maxHP.toLocaleString()}\n` +
      `**ATK:** ${boss.attack} | **DEF:** ${boss.defense}\n\n` +
      'Dùng `,worldboss` để tấn công!\n' +
      `Phần thưởng: 💰${boss.rewards.gold.toLocaleString()} Gold | 💎${boss.rewards.gems} Gem | 🪙${boss.rewards.summerCoins} Summer Coin`
    )
    .setColor(0xFF0000);

  await message.channel.send({ embeds: [embed] });
}
