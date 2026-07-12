import { Client, GatewayIntentBits, Collection, Events, REST, Routes, SlashCommandBuilder, ActivityType } from 'discord.js';
import { config } from 'dotenv';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { Database } from './game/database';
import { setCooldown, getCooldown, formatCooldown } from './utils/cooldown';
import { isSecretChannel } from './game/beta';
import { loadAdminConfig, isUserBanned, isCommandDisabled, isSystemEnabled, trackCommand, trackMessage, trackError, isPaused } from './game/adminState';

config();

const PREFIX = ',';
const db = new Database();

const COOLDOWN_SECONDS = 7;

interface PrefixCommand {
  name: string;
  description: string;
  cooldown?: number;
  execute: (message: any, args: string[], db: Database) => Promise<void>;
}

interface SlashCommand {
  data: SlashCommandBuilder;
  cooldown?: number;
  execute: (interaction: any, db: Database) => Promise<void>;
}

const prefixCommands = new Map<string, PrefixCommand>();
const slashCommands = new Collection<string, SlashCommand>();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = require(filePath);
    
    if (command.prefixCommand) {
      prefixCommands.set(command.prefixCommand.name, command.prefixCommand);
      console.log(`✅ Prefix: ${PREFIX}${command.prefixCommand.name}`);
    }
    
    if (command.data && command.execute) {
      slashCommands.set(command.data.name, command);
      console.log(`✅ Slash: /${command.data.name}`);
    }
  } catch (error) {
    console.error(`❌ Failed to load ${file}:`, error);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  rest: { timeout: 60000 },
  presence: { activities: [{ name: ',help | Mùa Hè Bùng Nổ', type: ActivityType.Playing }] }
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Bot ready! Logged in as ${readyClient.user.tag}`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  
  try {
    console.log('🔄 Registering slash commands...');
    const commandsData = slashCommands.map(cmd => cmd.data.toJSON());
    
    if (process.env.CLIENT_ID) {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commandsData }
      );
      console.log('✅ Slash commands registered!');
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on(Events.Warn, (warning) => {
  console.warn('⚠️ Client warning:', warning);
});

client.on('disconnect', () => {
  console.log('🔌 Disconnected. Discord.js will auto-reconnect...');
});

client.on('error', (err) => {
  console.error('❌ Client error:', err.message);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (isPaused()) {
    return interaction.reply({ content: '⏸️ Bot đang tạm dừng!', ephemeral: true });
  }

  const allowedChannelIds = process.env.CHANNEL_ID?.split(',').map(id => id.trim());
  if (!isSecretChannel(interaction.channelId) && allowedChannelIds && allowedChannelIds.length > 0 && !allowedChannelIds.includes(interaction.channelId)) {
    return interaction.reply({
      content: '❌ Chỉ có thể sử dụng lệnh trong kênh được chỉ định!',
      ephemeral: true
    });
  }

  const command = slashCommands.get(interaction.commandName);
  if (!command) return;

  if (isUserBanned(interaction.user.id)) {
    return interaction.reply({ content: '❌ Bạn đã bị chặn sử dụng lệnh!', ephemeral: true });
  }
  if (isCommandDisabled(interaction.commandName)) {
    return interaction.reply({ content: '❌ Lệnh này đang bị tắt!', ephemeral: true });
  }

  const cooldownTime = command.cooldown || COOLDOWN_SECONDS;
  const remaining = getCooldown(interaction.user.id, interaction.commandName);
  
  if (isSystemEnabled('cooldown') && !isSecretChannel(interaction.channelId) && remaining > 0) {
    return interaction.reply({
      content: `⏰ Vui lòng đợi **${formatCooldown(remaining)}** nữa!`,
      ephemeral: true
    });
  }

  if (isSystemEnabled('cooldown') && !isSecretChannel(interaction.channelId)) {
    setCooldown(interaction.user.id, interaction.commandName, cooldownTime);
  }

  try {
    trackCommand(interaction.commandName);
    await command.execute(interaction, db);
  } catch (error) {
    trackError();
    console.error(`Error executing ${interaction.commandName}:`, error);
    const reply = { content: '❌ Có lỗi xảy ra!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  trackMessage();
  if (!message.content.startsWith(PREFIX)) return;

  const allowedChannelIds = process.env.CHANNEL_ID?.split(',').map(id => id.trim());
  if (!isSecretChannel(message.channel.id) && allowedChannelIds && allowedChannelIds.length > 0 && !allowedChannelIds.includes(message.channel.id)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = prefixCommands.get(commandName);
  if (!command) return;

  if (isUserBanned(message.author.id)) return;
  if (isPaused() && commandName !== 'admin') return;
  if (commandName !== 'admin' && isCommandDisabled(commandName)) return;

  const cooldownTime = command.cooldown || COOLDOWN_SECONDS;
  const remaining = getCooldown(message.author.id, commandName);
  
  if (isSystemEnabled('cooldown') && !isSecretChannel(message.channel.id) && remaining > 0) {
    const msg = await message.reply(`⏰ Vui lòng đợi **${formatCooldown(remaining)}** nữa!`);
    setTimeout(() => msg.delete().catch(() => {}), 3000);
    return;
  }

  try {
    if (isSystemEnabled('cooldown') && !isSecretChannel(message.channel.id)) {
      setCooldown(message.author.id, commandName, cooldownTime);
    }
    trackCommand(commandName);
    await command.execute(message, args, db);
  } catch (error) {
    trackError();
    console.error(`Error executing ${commandName}:`, error);
    message.reply('❌ Có lỗi xảy ra!');
  }
});

const app = express();

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    bot: client.user?.tag || 'connecting...',
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;

function startSelfPing() {
  const selfPingUrl = process.env.SELF_PING_URL;
  if (!selfPingUrl) return;

  console.log(`🔄 Self-ping enabled: ${selfPingUrl}`);
  
  setInterval(() => {
    https.get(selfPingUrl, (res) => {
      console.log(`Ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Ping error:', err.message);
    });
  }, 5 * 60 * 1000);
}

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found!');
    process.exit(1);
  }

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('❌ DISCORD_TOKEN not found!');
    process.exit(1);
  }

  await db.connect(mongoUri);
  await loadAdminConfig();
  console.log('✅ Admin config loaded');

  app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
    startSelfPing();
  });

  async function connectDiscord() {
    try {
      console.log('🔑 Attempting Discord login...');
      console.log('Token starts with:', token?.substring(0, 10) + '...');
      console.log('Token length:', token?.length);
      await client.login(token);
      console.log('✅ client.login() resolved');
    } catch (err) {
      console.error('❌ Discord login failed:', (err as Error).message || err);
      console.log('🔄 Retrying in 30s...');
      setTimeout(connectDiscord, 30000);
    }
  }

  await connectDiscord();
}

process.on('unhandledRejection', (error) => {
  trackError();
  console.error('❌ Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  setTimeout(() => process.exit(1), 1000);
});

start().catch(console.error);
