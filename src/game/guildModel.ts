import mongoose, { Schema, Document } from 'mongoose';

export interface IGuild extends Document {
  name: string;
  tag: string;
  leaderId: string;
  members: { userId: string; role: 'leader' | 'officer' | 'member'; joinedAt: number; donated: number }[];
  level: number;
  exp: number;
  gold: number;
  maxMembers: number;
  createdAt: number;
}

export const GuildSchema = new Schema<IGuild>({
  name: { type: String, required: true, unique: true },
  tag: { type: String, required: true, unique: true },
  leaderId: { type: String, required: true },
  members: [{
    userId: String,
    role: { type: String, default: 'member' },
    joinedAt: { type: Number, default: Date.now },
    donated: { type: Number, default: 0 }
  }],
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  maxMembers: { type: Number, default: 10 },
  createdAt: { type: Number, default: Date.now }
});

export const GuildModel = mongoose.model<IGuild>('Guild', GuildSchema);
