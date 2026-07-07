import { GuildModel, IGuild } from './guildModel';

export interface Guild {
  id: string;
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

function docToGuild(doc: IGuild): Guild {
  return {
    id: doc._id.toString(),
    name: doc.name,
    tag: doc.tag,
    leaderId: doc.leaderId,
    members: doc.members || [],
    level: doc.level || 1,
    exp: doc.exp || 0,
    gold: doc.gold || 0,
    maxMembers: doc.maxMembers || 10,
    createdAt: doc.createdAt || Date.now(),
  };
}

export class GuildDB {
  async createGuild(name: string, tag: string, leaderId: string): Promise<Guild> {
    const doc = await GuildModel.create({
      name,
      tag: tag.toUpperCase(),
      leaderId,
      members: [{ userId: leaderId, role: 'leader', joinedAt: Date.now(), donated: 0 }],
    });
    return docToGuild(doc);
  }

  async getGuildByName(name: string): Promise<Guild | null> {
    const doc = await GuildModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    return doc ? docToGuild(doc) : null;
  }

  async getGuildByTag(tag: string): Promise<Guild | null> {
    const doc = await GuildModel.findOne({ tag: tag.toUpperCase() });
    return doc ? docToGuild(doc) : null;
  }

  async getGuildByMember(userId: string): Promise<Guild | null> {
    const doc = await GuildModel.findOne({ 'members.userId': userId });
    return doc ? docToGuild(doc) : null;
  }

  async getGuildById(id: string): Promise<Guild | null> {
    const doc = await GuildModel.findById(id);
    return doc ? docToGuild(doc) : null;
  }

  async updateGuild(guild: Guild): Promise<void> {
    await GuildModel.findOneAndUpdate(
      { _id: guild.id },
      {
        name: guild.name,
        tag: guild.tag,
        leaderId: guild.leaderId,
        members: guild.members,
        level: guild.level,
        exp: guild.exp,
        gold: guild.gold,
        maxMembers: guild.maxMembers,
      }
    );
  }

  async deleteGuild(guildId: string): Promise<void> {
    await GuildModel.findByIdAndDelete(guildId);
  }

  async getAllGuilds(): Promise<Guild[]> {
    const docs = await GuildModel.find();
    return docs.map(docToGuild);
  }
}
