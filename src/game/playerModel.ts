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
  inventory: {
    items: {
      itemId: string;
      quantity: number;
    }[];
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
  inventory: {
    items: [{
      itemId: String,
      quantity: Number
    }],
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
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

export const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);
