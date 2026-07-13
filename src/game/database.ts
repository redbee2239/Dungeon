import mongoose from 'mongoose';
import { PlayerModel, IPlayer } from './playerModel';
import { CodeModel } from './codeModel';
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
  gems: number;
  inventory: {
    items: InventoryItem[];
    chests: ChestItem[];
    equipped: {
      weapon: string | null;
      armor: string | null;
      accessory: string | null;
    };
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
  gachaHistory: {
    skillId: string;
    rarity: string;
    date: Date;
  }[];
  gachaPity: {
    epic: number;
    legendary: number;
  };
  petGachaPity: number;
  equippedPet: string | null;
  ownedPets: { petId: string; quantity: number }[];
  afk: {
    isAfk: boolean;
    startTime: number;
  };
  quests: {
    daily: { questId: string; progress: number; claimed: boolean }[];
    dailyLastReset: number;
    weekly: { questId: string; progress: number; claimed: boolean }[];
    weeklyLastReset: number;
  };
  expBoostCharges: number;
  createdAt: Date;
  lastActive: Date;
}

export interface ChestItem {
  chestId: string;
  quantity: number;
}

function docToPlayer(doc: IPlayer): Player {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    characterClass: doc.characterClass as CharacterClass,
    stats: doc.stats as PlayerStats,
    gems: doc.gems || 0,
    inventory: {
      items: doc.inventory.items || [],
      chests: doc.inventory.chests || [],
      equipped: doc.inventory.equipped || { weapon: null, armor: null, accessory: null },
      maxSlots: doc.inventory.maxSlots
    },
    dungeon: doc.dungeon,
    skillPoints: doc.skillPoints,
    unlockedSkills: doc.unlockedSkills,
    equippedSkill: doc.equippedSkill,
    totalMonstersKilled: doc.totalMonstersKilled,
    totalGoldEarned: doc.totalGoldEarned,
    highestFloor: doc.highestFloor,
    gachaHistory: doc.gachaHistory || [],
    gachaPity: doc.gachaPity || { epic: 0, legendary: 0 },
    petGachaPity: doc.petGachaPity || 0,
    equippedPet: doc.equippedPet || null,
    ownedPets: doc.ownedPets || [],
    afk: doc.afk || { isAfk: false, startTime: 0 },
    quests: doc.quests || { daily: [], dailyLastReset: 0, weekly: [], weeklyLastReset: 0 },
    expBoostCharges: doc.expBoostCharges || 0,
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
    
    const startingSkills: Record<CharacterClass, string> = {
      warrior: 'basic_slash',
      mage: 'spark',
      rogue: 'quick_strike',
      cleric: 'holy_smite',
      gladiator: 'battle_cry',
      summoner: 'summon_wolf',
      archer: 'quick_shot',
      necromancer: 'drain_life'
    };
    
    const doc = await PlayerModel.create({
      userId,
      name,
      characterClass,
      stats,
      gems: 0,
      inventory: { items: [], chests: [], equipped: { weapon: null, armor: null, accessory: null }, maxSlots: 20 },
      dungeon: {
        currentFloor: 1,
        roomsExplored: 0,
        monstersDefeated: 0,
        isActive: false,
        startTime: 0
      },
      skillPoints: 0,
      unlockedSkills: [startingSkills[characterClass]],
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
        gems: player.gems,
        inventory: player.inventory,
        dungeon: player.dungeon,
        skillPoints: player.skillPoints,
        unlockedSkills: player.unlockedSkills,
        equippedSkill: player.equippedSkill,
        totalMonstersKilled: player.totalMonstersKilled,
        totalGoldEarned: player.totalGoldEarned,
        highestFloor: player.highestFloor,
        gachaHistory: player.gachaHistory,
        gachaPity: player.gachaPity,
        petGachaPity: player.petGachaPity,
        equippedPet: player.equippedPet,
        ownedPets: player.ownedPets,
        afk: player.afk,
        quests: player.quests,
        expBoostCharges: player.expBoostCharges,
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
      player.stats = levelUp(player.stats, player.characterClass);
      player.skillPoints += 3;
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

  async addGems(player: Player, gems: number): Promise<void> {
    player.gems += gems;
    await this.updatePlayer(player);
  }

  async removeGems(player: Player, gems: number): Promise<boolean> {
    if (player.gems < gems) return false;
    player.gems -= gems;
    await this.updatePlayer(player);
    return true;
  }

  async addChest(player: Player, chestId: string, quantity: number = 1): Promise<void> {
    const existing = player.inventory.chests.find(c => c.chestId === chestId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      player.inventory.chests.push({ chestId, quantity });
    }
    await this.updatePlayer(player);
  }

  async removeChest(player: Player, chestId: string, quantity: number = 1): Promise<boolean> {
    const index = player.inventory.chests.findIndex(c => c.chestId === chestId);
    if (index === -1) return false;
    
    const chest = player.inventory.chests[index];
    if (chest.quantity < quantity) return false;
    
    chest.quantity -= quantity;
    if (chest.quantity <= 0) {
      player.inventory.chests.splice(index, 1);
    }
    
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
