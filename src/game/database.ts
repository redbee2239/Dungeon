import mongoose from 'mongoose';
import { PlayerModel, IPlayer } from './playerModel';
import { PlayerStats, CharacterClass, createBaseStats, getExpToNextLevel, levelUp } from './classes';
import { Item, ITEMS } from './items';

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface Player {
  id: string;
  userId: string;
  name: string;
  characterClass: CharacterClass;
  stats: PlayerStats;
  inventory: {
    items: InventoryItem[];
    maxSlots: number;
  };
  dungeon: {
    currentFloor: number;
    roomsExplored: number;
    monstersDefeated: number;
    isActive: boolean;
    startTime: number;
  };
  skillPoints: number;
  unlockedSkills: string[];
  equippedSkill: string | null;
  totalMonstersKilled: number;
  totalGoldEarned: number;
  highestFloor: number;
  createdAt: Date;
  lastActive: Date;
}

function docToPlayer(doc: IPlayer): Player {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    characterClass: doc.characterClass as CharacterClass,
    stats: doc.stats as PlayerStats,
    inventory: doc.inventory,
    dungeon: doc.dungeon,
    skillPoints: doc.skillPoints,
    unlockedSkills: doc.unlockedSkills,
    equippedSkill: doc.equippedSkill,
    totalMonstersKilled: doc.totalMonstersKilled,
    totalGoldEarned: doc.totalGoldEarned,
    highestFloor: doc.highestFloor,
    createdAt: doc.createdAt,
    lastActive: doc.lastActive
  };
}

export class Database {
  private connected = false;

  async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      this.connected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async getPlayer(userId: string): Promise<Player | null> {
    const doc = await PlayerModel.findOne({ userId });
    return doc ? docToPlayer(doc) : null;
  }

  async createPlayer(userId: string, name: string, characterClass: CharacterClass): Promise<Player> {
    const stats = createBaseStats(characterClass);
    const doc = await PlayerModel.create({
      userId,
      name,
      characterClass,
      stats,
      inventory: { items: [], maxSlots: 20 },
      dungeon: {
        currentFloor: 1,
        roomsExplored: 0,
        monstersDefeated: 0,
        isActive: false,
        startTime: 0
      },
      skillPoints: 0,
      unlockedSkills: [],
      equippedSkill: null,
      totalMonstersKilled: 0,
      totalGoldEarned: 0,
      highestFloor: 1
    });
    return docToPlayer(doc);
  }

  async updatePlayer(player: Player): Promise<void> {
    await PlayerModel.findOneAndUpdate(
      { userId: player.userId },
      {
        stats: player.stats,
        inventory: player.inventory,
        dungeon: player.dungeon,
        skillPoints: player.skillPoints,
        unlockedSkills: player.unlockedSkills,
        equippedSkill: player.equippedSkill,
        totalMonstersKilled: player.totalMonstersKilled,
        totalGoldEarned: player.totalGoldEarned,
        highestFloor: player.highestFloor,
        lastActive: new Date()
      }
    );
  }

  async addExp(player: Player, exp: number): Promise<{ leveled: boolean; levelsGained: number }> {
    let leveled = false;
    let levelsGained = 0;

    player.stats.exp += exp;
    while (player.stats.exp >= player.stats.expToNext) {
      player.stats.exp -= player.stats.expToNext;
      player.stats = levelUp(player.stats);
      player.skillPoints += 1;
      leveled = true;
      levelsGained++;
    }

    await this.updatePlayer(player);
    return { leveled, levelsGained };
  }

  async addGold(player: Player, gold: number): Promise<void> {
    player.stats.gold += gold;
    player.totalGoldEarned += gold;
    await this.updatePlayer(player);
  }

  async removeGold(player: Player, gold: number): Promise<boolean> {
    if (player.stats.gold < gold) return false;
    player.stats.gold -= gold;
    await this.updatePlayer(player);
    return true;
  }

  async getLeaderboard(): Promise<Player[]> {
    const docs = await PlayerModel.find()
      .sort({ 'stats.level': -1, highestFloor: -1 })
      .limit(10);
    return docs.map(docToPlayer);
  }

  async getAllPlayers(): Promise<Player[]> {
    const docs = await PlayerModel.find();
    return docs.map(docToPlayer);
  }
}
