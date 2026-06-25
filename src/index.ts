import { Client, GatewayIntentBits, Collection, Events, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from 'dotenv';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { Database } from './game/database';

config();

const PREFIX = ',';
const db = new Database();

interface PrefixCommand {
  name: string;
  description: string;
  execute: (message: any, args: string[], db: Database) => Promise<void>;
}

interface SlashCommand {
  data: SlashCommandBuilder;
  execute: (interaction: any, db: Database) => Promise<void>;
}

const prefixCommands = new Map<string, PrefixCommand>();
const slashCommands = new Collection<string, SlashCommand>();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if (command.prefixCommand) {
    prefixCommands.set(command.prefixCommand.name, command.prefixCommand);
    console.log(`✅ Prefix: ${PREFIX}${command.prefixCommand.name}`);
  }
  
  if (command.data && command.execute) {
    slashCommands.set(command.data.name, command);
    console.log(`✅ Slash: /${command.data.name}`);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, db);
  } catch (error) {
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
  if (!message.content.startsWith(PREFIX)) return;

  const allowedChannelId = process.env.CHANNEL_ID;
  if (allowedChannelId && message.channel.id !== allowedChannelId) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = prefixCommands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, db);
  } catch (error) {
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

  app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
    startSelfPing();
  });

  await client.login(token);
}

start().catch(console.error);
