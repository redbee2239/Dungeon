import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  userId: string;
  name: string;
  characterClass: string;
  stats: {
    level: number;
    exp: number;
    expToNext: number;
    hp: number;
    maxHP: number;
    mp: number;
    maxMP: number;
    attack: number;
    defense: number;
    speed: number;
    gold: number;
  };
  gems: number;
  inventory: {
    items: {
      itemId: string;
      quantity: number;
    }[];
    chests: {
      chestId: string;
      quantity: number;
    }[];
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
  summerCoins: number;
  summerEvent: {
    consecutiveDays: number;
    lastDailyLogin: number;
    claimedCode: boolean;
    minigameLastPlay: number;
    minigameWins: number;
  };
  createdAt: Date;
  lastActive: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  characterClass: { type: String, required: true },
  stats: {
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    expToNext: { type: Number, default: 100 },
    hp: { type: Number, default: 100 },
    maxHP: { type: Number, default: 100 },
    mp: { type: Number, default: 50 },
    maxMP: { type: Number, default: 50 },
    attack: { type: Number, default: 10 },
    defense: { type: Number, default: 5 },
    speed: { type: Number, default: 5 },
    gold: { type: Number, default: 50 }
  },
  gems: { type: Number, default: 0 },
  inventory: {
    items: [{
      itemId: String,
      quantity: Number
    }],
    chests: [{
      chestId: String,
      quantity: Number
    }],
    equipped: {
      weapon: { type: String, default: null },
      armor: { type: String, default: null },
      accessory: { type: String, default: null }
    },
    maxSlots: { type: Number, default: 20 }
  },
  dungeon: {
    currentFloor: { type: Number, default: 1 },
    roomsExplored: { type: Number, default: 0 },
    monstersDefeated: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    startTime: { type: Number, default: 0 }
  },
  skillPoints: { type: Number, default: 0 },
  unlockedSkills: [String],
  equippedSkill: { type: String, default: null },
  totalMonstersKilled: { type: Number, default: 0 },
  totalGoldEarned: { type: Number, default: 0 },
  highestFloor: { type: Number, default: 1 },
  gachaHistory: [{
    skillId: String,
    rarity: String,
    date: { type: Date, default: Date.now }
  }],
  gachaPity: {
    epic: { type: Number, default: 0 },
    legendary: { type: Number, default: 0 }
  },
  petGachaPity: { type: Number, default: 0 },
  equippedPet: { type: String, default: null },
  ownedPets: [{
    petId: String,
    quantity: { type: Number, default: 1 }
  }],
  afk: {
    isAfk: { type: Boolean, default: false },
    startTime: { type: Number, default: 0 }
  },
  quests: {
    daily: [{
      questId: String,
      progress: { type: Number, default: 0 },
      claimed: { type: Boolean, default: false }
    }],
    dailyLastReset: { type: Number, default: 0 },
    weekly: [{
      questId: String,
      progress: { type: Number, default: 0 },
      claimed: { type: Boolean, default: false }
    }],
    weeklyLastReset: { type: Number, default: 0 }
  },
  expBoostCharges: { type: Number, default: 0 },
  summerCoins: { type: Number, default: 0 },
  summerEvent: {
    consecutiveDays: { type: Number, default: 0 },
    lastDailyLogin: { type: Number, default: 0 },
    claimedCode: { type: Boolean, default: false },
    minigameLastPlay: { type: Number, default: 0 },
    minigameWins: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

export const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);
