import { Monster } from './monsters';
import { calculateBonusStats } from './inventory';
import { Player } from './database';

export interface WorldBoss {
  id: string;
  name: string;
  emoji: string;
  level: number;
  maxHP: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  rewards: {
    gold: number;
    gems: number;
    summerCoins: number;
  };
  participants: Map<string, { damage: number; lastAttack: number }>;
  active: boolean;
  spawnTime: number;
}

const WORLD_BOSS_TEMPLATES: Omit<WorldBoss, 'hp' | 'participants' | 'active' | 'spawnTime'>[] = [
  {
    id: 'world_dragon',
    name: 'Rồng Hủy Diệt',
    emoji: '🐉',
    level: 50,
    maxHP: 500000,
    attack: 200,
    defense: 100,
    speed: 80,
    rewards: { gold: 5000, gems: 200, summerCoins: 100 },
  },
  {
    id: 'world_demon',
    name: 'Ác Quỷ Tối Cao',
    emoji: '👹',
    level: 45,
    maxHP: 400000,
    attack: 180,
    defense: 90,
    speed: 85,
    rewards: { gold: 4000, gems: 150, summerCoins: 80 },
  },
  {
    id: 'world_golem',
    name: 'Thạch ĐẠI',
    emoji: '🗿',
    level: 40,
    maxHP: 600000,
    attack: 150,
    defense: 150,
    speed: 40,
    rewards: { gold: 4500, gems: 180, summerCoins: 90 },
  },
];

let currentBoss: WorldBoss | null = null;

export function getCurrentBoss(): WorldBoss | null {
  return currentBoss;
}

export function spawnWorldBoss(): WorldBoss {
  const template = WORLD_BOSS_TEMPLATES[Math.floor(Math.random() * WORLD_BOSS_TEMPLATES.length)];
  currentBoss = {
    ...template,
    hp: template.maxHP,
    participants: new Map(),
    active: true,
    spawnTime: Date.now(),
  };
  return currentBoss;
}

export function despawnWorldBoss(): void {
  currentBoss = null;
}

export function attackWorldBoss(
  player: Player,
  critChance: number = 0.1
): { damage: number; killed: boolean; message: string; isCrit: boolean } {
  if (!currentBoss || !currentBoss.active) {
    return { damage: 0, killed: false, message: '❌ Không có World Boss nào!', isCrit: false };
  }

  const bonus = calculateBonusStats(player.inventory, player.equippedPet);
  const totalAtk = player.stats.attack + bonus.attack;
  const totalDef = player.stats.defense + bonus.defense;

  const baseDmg = Math.max(1, totalAtk - Math.floor(currentBoss.defense / 2));
  const isCrit = Math.random() < critChance;
  const damage = isCrit ? Math.floor(baseDmg * 2) : baseDmg;

  currentBoss.hp = Math.max(0, currentBoss.hp - damage);

  const existing = currentBoss.participants.get(player.userId);
  if (existing) {
    existing.damage += damage;
    existing.lastAttack = Date.now();
  } else {
    currentBoss.participants.set(player.userId, { damage, lastAttack: Date.now() });
  }

  const killed = currentBoss.hp <= 0;
  if (killed) {
    currentBoss.active = false;
  }

  let msg = `${currentBoss.emoji} **${currentBoss.name}**\n`;
  msg += `HP: ${currentBoss.hp.toLocaleString()}/${currentBoss.maxHP.toLocaleString()}\n`;
  msg += `🎯 Gây **${damage.toLocaleString()}** damage${isCrit ? ' **CRIT!**' : ''}`;

  return { damage, killed, message: msg, isCrit };
}

export function getBossRewards(): { gold: number; gems: number; summerCoins: number } | null {
  if (!currentBoss) return null;
  return currentBoss.rewards;
}

export function getTopDamageDealers(): { userId: string; damage: number }[] {
  if (!currentBoss) return [];
  const entries = Array.from(currentBoss.participants.entries());
  return entries
    .map(([userId, data]) => ({ userId, damage: data.damage }))
    .sort((a, b) => b.damage - a.damage);
}

export function shouldSpawnBoss(): boolean {
  if (currentBoss?.active) return false;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return (hours === 10 || hours === 18) && minutes === 0 && (!currentBoss || !currentBoss.active);
}

const BOSS_SPAWN_INTERVAL = 8 * 60 * 60 * 1000;
let lastSpawnCheck = 0;

export function checkAndSpawnBoss(): WorldBoss | null {
  if (currentBoss?.active) return null;
  const now = Date.now();
  if (now - lastSpawnCheck < BOSS_SPAWN_INTERVAL) return null;
  lastSpawnCheck = now;
  return spawnWorldBoss();
}
