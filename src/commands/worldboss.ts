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
      // Boss defeated - distribute rewards
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

      const embed = new EmbedBuilder()
        .setTitle('💀 World Boss Defeated!')
        .setDescription(rewardMsg)
        .setColor(0x00FF00);

      return message.reply({ embeds: [embed] });
    }

    // Normal attack response
    const hpPercent = Math.floor((boss.hp / boss.maxHP) * 100);
    const bar = hpBar(hpPercent);

    const embed = new EmbedBuilder()
      .setTitle(`${boss.emoji} ${boss.name}`)
      .setDescription(
        result.message + '\n\n' +
        `${bar} **${hpPercent}%**\n` +
        `Tham gia: ${boss.participants.size} người`
      )
      .setColor(hpPercent > 50 ? 0xFF0000 : hpPercent > 20 ? 0xFFAA00 : 0x00FF00);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('wb_attack').setLabel('⚔️ Tấn Công').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('wb_info').setLabel('📊 Info').setStyle(ButtonStyle.Secondary),
    );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on('collect', async (i: any) => {
      if (i.user.id !== userId) {
        return i.reply({ content: '❌ Không phải lượt của bạn!', ephemeral: true });
      }

      if (i.customId === 'wb_attack') {
        const p = await db.getPlayer(userId);
        if (!p) return i.reply({ content: '❌ Lỗi!', ephemeral: true });

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

          const finalEmbed = new EmbedBuilder()
            .setTitle('💀 World Boss Defeated!')
            .setDescription(rewardMsg)
            .setColor(0x00FF00);

          return i.update({ embeds: [finalEmbed], components: [] });
        }

        const newHpPercent = Math.floor((boss!.hp / boss!.maxHP) * 100);
        const bar = hpBar(newHpPercent);

        const atkEmbed = new EmbedBuilder()
          .setTitle(`${boss!.emoji} ${boss!.name}`)
          .setDescription(
            atkResult.message + '\n\n' +
            `${bar} **${newHpPercent}%**\n` +
            `Tham gia: ${boss!.participants.size} người`
          )
          .setColor(newHpPercent > 50 ? 0xFF0000 : newHpPercent > 20 ? 0xFFAA00 : 0x00FF00);

        return i.update({ embeds: [atkEmbed], components: [row] });
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
