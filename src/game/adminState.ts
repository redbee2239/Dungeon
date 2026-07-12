import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminConfig extends Document {
  paused: boolean;
  systems: {
    beta: boolean;
    event: boolean;
    worldboss: boolean;
    crafting: boolean;
    gacha: boolean;
    cooldown: boolean;
  };
  disabledCommands: string[];
  bannedUsers: string[];
}

const AdminConfigSchema = new Schema<IAdminConfig>({
  paused: { type: Boolean, default: false },
  systems: {
    beta: { type: Boolean, default: false },
    event: { type: Boolean, default: true },
    worldboss: { type: Boolean, default: true },
    crafting: { type: Boolean, default: false },
    gacha: { type: Boolean, default: true },
    cooldown: { type: Boolean, default: true },
  },
  disabledCommands: [{ type: String }],
  bannedUsers: [{ type: String }],
});

export const AdminConfigModel = mongoose.model<IAdminConfig>('AdminConfig', AdminConfigSchema);

let config: IAdminConfig | null = null;

export async function loadAdminConfig(): Promise<IAdminConfig> {
  config = await AdminConfigModel.findOne();
  if (!config) {
    config = await AdminConfigModel.create({});
  }
  return config;
}

export function getAdminConfig(): IAdminConfig {
  if (!config) throw new Error('AdminConfig not loaded');
  return config;
}

export async function saveAdminConfig(): Promise<void> {
  if (!config) return;
  await config.save();
}

// Pause system
export function isPaused(): boolean {
  if (!config) return false;
  return config.paused;
}

export async function setPaused(value: boolean): Promise<void> {
  if (!config) throw new Error('AdminConfig not loaded');
  config.paused = value;
  await saveAdminConfig();
}

// System toggles
export function isSystemEnabled(system: string): boolean {
  if (!config) return true;
  return (config.systems as any)[system] ?? true;
}

export async function toggleSystem(system: string): Promise<boolean> {
  if (!config) throw new Error('AdminConfig not loaded');
  const current = (config.systems as any)[system];
  if (current === undefined) throw new Error(`Hệ thống "${system}" không tồn tại`);
  (config.systems as any)[system] = !current;
  await saveAdminConfig();
  return (config.systems as any)[system];
}

export async function setSystem(system: string, value: boolean): Promise<void> {
  if (!config) throw new Error('AdminConfig not loaded');
  if ((config.systems as any)[system] === undefined) throw new Error(`Hệ thống "${system}" không tồn tại`);
  (config.systems as any)[system] = value;
  await saveAdminConfig();
}

// Command disable/enable
export function isCommandDisabled(commandName: string): boolean {
  if (!config) return false;
  return config.disabledCommands.includes(commandName);
}

export async function toggleCommand(commandName: string): Promise<boolean> {
  if (!config) throw new Error('AdminConfig not loaded');
  const idx = config.disabledCommands.indexOf(commandName);
  if (idx >= 0) {
    config.disabledCommands.splice(idx, 1);
    await saveAdminConfig();
    return true; // now enabled
  } else {
    config.disabledCommands.push(commandName);
    await saveAdminConfig();
    return false; // now disabled
  }
}

// Ban system
export function isUserBanned(userId: string): boolean {
  if (!config) return false;
  return config.bannedUsers.includes(userId);
}

export async function banUser(userId: string): Promise<void> {
  if (!config) throw new Error('AdminConfig not loaded');
  if (!config.bannedUsers.includes(userId)) {
    config.bannedUsers.push(userId);
    await saveAdminConfig();
  }
}

export async function unbanUser(userId: string): Promise<void> {
  if (!config) throw new Error('AdminConfig not loaded');
  const idx = config.bannedUsers.indexOf(userId);
  if (idx >= 0) {
    config.bannedUsers.splice(idx, 1);
    await saveAdminConfig();
  }
}

// Stats tracking (in-memory, resets on restart)
const stats = {
  commandUses: new Map<string, number>(),
  messagesProcessed: 0,
  errors: 0,
  startTime: Date.now(),
};

export function trackCommand(commandName: string): void {
  const current = stats.commandUses.get(commandName) || 0;
  stats.commandUses.set(commandName, current + 1);
}

export function trackMessage(): void {
  stats.messagesProcessed++;
}

export function trackError(): void {
  stats.errors++;
}

export function getStats() {
  const topCommands = Array.from(stats.commandUses.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  return {
    commandUses: topCommands,
    totalCommands: Array.from(stats.commandUses.values()).reduce((a, b) => a + b, 0),
    messagesProcessed: stats.messagesProcessed,
    errors: stats.errors,
    uptime: process.uptime(),
    startTime: stats.startTime,
  };
}
