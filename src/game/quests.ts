export interface Quest {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  reward: {
    gold: number;
    gems: number;
    exp: number;
  };
}

export interface PlayerQuest {
  questId: string;
  progress: number;
  claimed: boolean;
}

export interface QuestData {
  daily: {
    quests: PlayerQuest[];
    lastReset: number;
  };
  weekly: {
    quests: PlayerQuest[];
    lastReset: number;
  };
}

const DAILY_QUESTS: Quest[] = [
  { id: 'daily_kill_5', name: 'Sát Thủ Nhí', emoji: '🗡️', description: 'Giết 5 quái vật', type: 'daily', target: 5, reward: { gold: 50, gems: 10, exp: 30 } },
  { id: 'daily_kill_15', name: 'Thợ Săn', emoji: '🏹', description: 'Giết 15 quái vật', type: 'daily', target: 15, reward: { gold: 150, gems: 25, exp: 80 } },
  { id: 'daily_kill_30', name: 'Diệt Súc', emoji: '💀', description: 'Giết 30 quái vật', type: 'daily', target: 30, reward: { gold: 300, gems: 50, exp: 150 } },
  { id: 'daily_floor_3', name: 'Khám Phá', emoji: '🏰', description: 'Clear 3 tầng dungeon', type: 'daily', target: 3, reward: { gold: 80, gems: 15, exp: 50 } },
  { id: 'daily_floor_7', name: 'Thám Hiểm', emoji: '🗺️', description: 'Clear 7 tầng dungeon', type: 'daily', target: 7, reward: { gold: 200, gems: 35, exp: 120 } },
  { id: 'daily_gold', name: 'Kho Báu', emoji: '💰', description: 'Kiếm 500 Gold', type: 'daily', target: 500, reward: { gold: 0, gems: 30, exp: 60 } },
  { id: 'daily_potion', name: 'Y Học', emoji: '🧪', description: 'Sử dụng 3 thuốc', type: 'daily', target: 3, reward: { gold: 60, gems: 10, exp: 40 } },
];

const WEEKLY_QUESTS: Quest[] = [
  { id: 'weekly_kill_100', name: 'Bọt Máu', emoji: '🩸', description: 'Giết 100 quái vật', type: 'weekly', target: 100, reward: { gold: 800, gems: 150, exp: 500 } },
  { id: 'weekly_kill_300', name: 'Diệt Tộc', emoji: '⚔️', description: 'Giết 300 quái vật', type: 'weekly', target: 300, reward: { gold: 2000, gems: 400, exp: 1200 } },
  { id: 'weekly_floor_20', name: 'Chinh Phục', emoji: '🗼', description: 'Clear 20 tầng dungeon', type: 'weekly', target: 20, reward: { gold: 600, gems: 120, exp: 400 } },
  { id: 'weekly_floor_50', name: 'Vô Cực', emoji: '🌀', description: 'Clear 50 tầng dungeon', type: 'weekly', target: 50, reward: { gold: 1500, gems: 350, exp: 1000 } },
  { id: 'weekly_boss_3', name: 'Săn Boss', emoji: '👑', description: 'Đánh bại 3 Boss', type: 'weekly', target: 3, reward: { gold: 500, gems: 100, exp: 300 } },
  { id: 'weekly_boss_8', name: 'Vua Săn', emoji: '🏆', description: 'Đánh bại 8 Boss', type: 'weekly', target: 8, reward: { gold: 1200, gems: 250, exp: 800 } },
  { id: 'weekly_gold', name: 'Triệu Phú', emoji: '🏦', description: 'Kiếm 5000 Gold', type: 'weekly', target: 5000, reward: { gold: 0, gems: 200, exp: 600 } },
  { id: 'weekly_floor_30', name: 'Tiến Đạt', emoji: '🏃', description: 'Clear 30 tầng dungeon', type: 'weekly', target: 30, reward: { gold: 900, gems: 180, exp: 550 } },
];

export function getDailyQuests(): Quest[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...DAILY_QUESTS].sort((a, b) => {
    const ha = (seed + a.id.charCodeAt(0) * 31) % 100;
    const hb = (seed + b.id.charCodeAt(0) * 31) % 100;
    return ha - hb;
  });
  return shuffled.slice(0, 3);
}

export function getWeeklyQuests(): Quest[] {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const seed = now.getFullYear() * 100 + weekNum;
  return WEEKLY_QUESTS;
}

export function shouldResetDaily(lastReset: number): boolean {
  const last = new Date(lastReset);
  const now = new Date();
  return last.toDateString() !== now.toDateString();
}

export function shouldResetWeekly(lastReset: number): boolean {
  const last = new Date(lastReset);
  const now = new Date();
  const getWeek = (d: Date) => {
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.floor((d.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  };
  return last.getFullYear() !== now.getFullYear() || getWeek(last) !== getWeek(now);
}

export function resetDailyQuests(quests: PlayerQuest[]): PlayerQuest[] {
  const newQuests = getDailyQuests();
  return newQuests.map(q => ({ questId: q.id, progress: 0, claimed: false }));
}

export function resetWeeklyQuests(quests: PlayerQuest[]): PlayerQuest[] {
  const newQuests = getWeeklyQuests();
  return newQuests.map(q => ({ questId: q.id, progress: 0, claimed: false }));
}

export function getQuestById(id: string): Quest | undefined {
  return [...DAILY_QUESTS, ...WEEKLY_QUESTS].find(q => q.id === id);
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function getDailyMultiplier(): number {
  return isWeekend() ? 2 : 1;
}
