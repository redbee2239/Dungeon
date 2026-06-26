import mongoose, { Schema, Document } from 'mongoose';

export interface ICode extends Document {
  code: string;
  usedBy: string[];
  maxUses: number;
  reward: number;
  createdAt: Date;
}

const CodeSchema = new Schema<ICode>({
  code: { type: String, required: true, unique: true },
  usedBy: [{ type: String }],
  maxUses: { type: Number, default: 10 },
  reward: { type: Number, default: 500 },
  createdAt: { type: Date, default: Date.now }
});

export const CodeModel = mongoose.model<ICode>('Code', CodeSchema);
