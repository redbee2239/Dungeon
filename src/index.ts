import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { Database } from './game/database';

config();

const PREFIX = ',';
const db = new Database();

interface Command {
  name: string;
  description: string;
  execute: (message: any, args: string[], db: Database) => Promise<void>;
}

const commands = new Map<string, Command>();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.prefixCommand) {
    commands.set(command.prefixCommand.name, command.prefixCommand);
    console.log(`✅ Loaded: ${PREFIX}${command.prefixCommand.name}`);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', (readyClient) => {
  console.log(`✅ Bot ready! Logged in as ${readyClient.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const allowedChannelId = process.env.CHANNEL_ID;
  if (allowedChannelId && message.channel.id !== allowedChannelId) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);
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
