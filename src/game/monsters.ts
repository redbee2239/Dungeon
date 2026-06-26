import { ItemRarity } from './items';

export interface Monster {
  id: string;
  name: string;
  emoji: string;
  level: number;
  hp: number;
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  expReward: number;
  goldReward: number;
  description: string;
  isBoss: boolean;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  emoji: string;
  baseLevel: number;
  baseHP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  expReward: number;
  goldReward: number;
  description: string;
  isBoss: boolean;
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  // === NORMAL MONSTERS ===
  {
    id: 'slime', name: 'Slime', emoji: '🟢',
    baseLevel: 1, baseHP: 75, baseAttack: 12, baseDefense: 4, baseSpeed: 5,
    expReward: 15, goldReward: 10,
    description: 'Quái vật gelatin yếu nhất.', isBoss: false
  },
  {
    id: 'goblin', name: 'Goblin', emoji: '👺',
    baseLevel: 2, baseHP: 110, baseAttack: 20, baseDefense: 8, baseSpeed: 12,
    expReward: 25, goldReward: 15,
    description: 'Goblin nhỏ nhưng nhanh.', isBoss: false
  },
  {
    id: 'skeleton', name: 'Bộ Xương', emoji: '💀',
    baseLevel: 3, baseHP: 150, baseAttack: 28, baseDefense: 12, baseSpeed: 8,
    expReward: 35, goldReward: 25,
    description: 'Xương sống tấn công người.', isBoss: false
  },
  {
    id: 'zombie', name: 'Zombie', emoji: '🧟',
    baseLevel: 4, baseHP: 200, baseAttack: 25, baseDefense: 8, baseSpeed: 4,
    expReward: 40, goldReward: 20,
    description: 'Thây ma slow nhưng dai.', isBoss: false
  },
  {
    id: 'spider', name: 'Nhện Độc', emoji: '🕷️',
    baseLevel: 5, baseHP: 140, baseAttack: 35, baseDefense: 10, baseSpeed: 20,
    expReward: 50, goldReward: 30,
    description: 'Nhện có nọc độc, cực nhanh.', isBoss: false
  },
  {
    id: 'orc', name: 'Orc', emoji: '👹',
    baseLevel: 6, baseHP: 250, baseAttack: 42, baseDefense: 18, baseSpeed: 8,
    expReward: 65, goldReward: 40,
    description: 'Orc khỏe mạnh và hung dữ.', isBoss: false
  },
  {
    id: 'troll', name: 'Troll', emoji: '🧌',
    baseLevel: 8, baseHP: 330, baseAttack: 50, baseDefense: 22, baseSpeed: 5,
    expReward: 80, goldReward: 50,
    description: 'Troll to lớn, hồi phục nhanh.', isBoss: false
  },
  {
    id: 'dark_mage', name: 'Pháp Sư Bóng Tối', emoji: '🧙',
    baseLevel: 10, baseHP: 225, baseAttack: 65, baseDefense: 16, baseSpeed: 18,
    expReward: 100, goldReward: 65,
    description: 'Pháp sư dùng bóng tối.', isBoss: false
  },
  {
    id: 'werewolf', name: 'Người Sói', emoji: '🐺',
    baseLevel: 12, baseHP: 350, baseAttack: 75, baseDefense: 20, baseSpeed: 28,
    expReward: 130, goldReward: 85,
    description: 'Người sói cực nhanh và mạnh.', isBoss: false
  },
  {
    id: 'assassin', name: 'Sát Thủ', emoji: '🗡️',
    baseLevel: 14, baseHP: 180, baseAttack: 85, baseDefense: 10, baseSpeed: 35,
    expReward: 140, goldReward: 90,
    description: 'Sát thủ nhanh như chớp.', isBoss: false
  },
  {
    id: 'minotaur', name: 'Minotaur', emoji: '🐂',
    baseLevel: 15, baseHP: 450, baseAttack: 82, baseDefense: 30, baseSpeed: 10,
    expReward: 160, goldReward: 100,
    description: 'Quái vật nửa người nửa bò.', isBoss: false
  },
  {
    id: 'vampire', name: 'Ma Cà Rồng', emoji: '🧛',
    baseLevel: 18, baseHP: 400, baseAttack: 90, baseDefense: 26, baseSpeed: 25,
    expReward: 200, goldReward: 130,
    description: 'Ma cà rồng hút máu.', isBoss: false
  },
  {
    id: 'wind_spirit', name: 'Tinh Linh Gió', emoji: '🌪️',
    baseLevel: 19, baseHP: 160, baseAttack: 70, baseDefense: 8, baseSpeed: 40,
    expReward: 220, goldReward: 140,
    description: 'Tinh linh gió, không thể nắm bắt.', isBoss: false
  },
  {
    id: 'demon', name: 'Quỷ', emoji: '😈',
    baseLevel: 20, baseHP: 500, baseAttack: 100, baseDefense: 35, baseSpeed: 18,
    expReward: 250, goldReward: 160,
    description: 'Quỷ từ địa ngục.', isBoss: false
  },
  {
    id: 'shadow', name: 'Bóng Tối', emoji: '🌑',
    baseLevel: 22, baseHP: 200, baseAttack: 95, baseDefense: 12, baseSpeed: 38,
    expReward: 280, goldReward: 170,
    description: 'Bóng tối di chuyển cực nhanh.', isBoss: false
  },
  {
    id: 'golem', name: 'Đá Khổng Lồ', emoji: '🗿',
    baseLevel: 25, baseHP: 750, baseAttack: 85, baseDefense: 50, baseSpeed: 3,
    expReward: 300, goldReward: 200,
    description: 'Đá sống phòng thủ cao.', isBoss: false
  },
  {
    id: 'harpy', name: 'Harpy', emoji: '🦅',
    baseLevel: 27, baseHP: 220, baseAttack: 90, baseDefense: 15, baseSpeed: 45,
    expReward: 350, goldReward: 220,
    description: 'Harpy bay cực nhanh.', isBoss: false
  },
  {
    id: 'hydra', name: 'Hydra', emoji: '🐲',
    baseLevel: 30, baseHP: 880, baseAttack: 115, baseDefense: 40, baseSpeed: 12,
    expReward: 400, goldReward: 250,
    description: 'Rắn nhiều đầu.', isBoss: false
  },
  {
    id: 'ninja', name: 'Ninja', emoji: '🥷',
    baseLevel: 32, baseHP: 280, baseAttack: 120, baseDefense: 18, baseSpeed: 50,
    expReward: 450, goldReward: 300,
    description: 'Ninja tàng hình và cực nhanh.', isBoss: false
  },
  {
    id: 'reaper', name: 'Thần Chết', emoji: '💀',
    baseLevel: 40, baseHP: 1000, baseAttack: 135, baseDefense: 45, baseSpeed: 30,
    expReward: 500, goldReward: 350,
    description: 'Thần chết gặt mạng.', isBoss: false
  },
  {
    id: 'phoenix', name: 'Phượng Hoàng', emoji: '🔥',
    baseLevel: 42, baseHP: 600, baseAttack: 140, baseDefense: 30, baseSpeed: 55,
    expReward: 600, goldReward: 400,
    description: 'Phượng hoàng bay bằng lửa.', isBoss: false
  },
  {
    id: 'void_lord', name: 'Chúa Tể Hư Không', emoji: '🕳️',
    baseLevel: 50, baseHP: 1250, baseAttack: 165, baseDefense: 55, baseSpeed: 25,
    expReward: 700, goldReward: 500,
    description: 'Chúa tể từ hư không.', isBoss: false
  },
  {
    id: 'flash', name: 'Tia Sáng', emoji: '⚡',
    baseLevel: 52, baseHP: 400, baseAttack: 150, baseDefense: 20, baseSpeed: 65,
    expReward: 800, goldReward: 550,
    description: 'Sinh vật ánh sáng, nhanh nhất.', isBoss: false
  },

  // === BOSSES (mỗi 5 tầng) ===
  {
    id: 'boss_goblin_king', name: 'Vua Goblin', emoji: '👑',
    baseLevel: 5, baseHP: 500, baseAttack: 35, baseDefense: 20, baseSpeed: 15,
    expReward: 100, goldReward: 80,
    description: 'Boss tầng 5 - Vua của bọn Goblin.', isBoss: true
  },
  {
    id: 'boss_skeleton_lord', name: 'Vua Xương', emoji: '💀',
    baseLevel: 10, baseHP: 850, baseAttack: 60, baseDefense: 30, baseSpeed: 18,
    expReward: 200, goldReward: 150,
    description: 'Boss tầng 10 - Vua của bộ xương.', isBoss: true
  },
  {
    id: 'boss_lich', name: 'Lich King', emoji: '☠️',
    baseLevel: 15, baseHP: 1200, baseAttack: 80, baseDefense: 35, baseSpeed: 22,
    expReward: 350, goldReward: 220,
    description: 'Boss tầng 15 - Vua xác sống.', isBoss: true
  },
  {
    id: 'boss_demon_lord', name: 'Vua Quỷ', emoji: '😈',
    baseLevel: 20, baseHP: 1600, baseAttack: 100, baseDefense: 45, baseSpeed: 25,
    expReward: 500, goldReward: 350,
    description: 'Boss tầng 20 - Vua quỷ dữ.', isBoss: true
  },
  {
    id: 'boss_minotaur_king', name: 'Vua Minotaur', emoji: '🐂',
    baseLevel: 25, baseHP: 2000, baseAttack: 120, baseDefense: 55, baseSpeed: 15,
    expReward: 650, goldReward: 450,
    description: 'Boss tầng 25 - Vua Minotaur.', isBoss: true
  },
  {
    id: 'boss_vampire_count', name: ' Bá Tước Ma Cà Rồng', emoji: '🧛',
    baseLevel: 30, baseHP: 2200, baseAttack: 135, baseDefense: 50, baseSpeed: 30,
    expReward: 800, goldReward: 550,
    description: 'Boss tầng 30 - Bá tước Ma Cà Rồng.', isBoss: true
  },
  {
    id: 'boss_hydra_king', name: 'Vua Hydra', emoji: '🐲',
    baseLevel: 35, baseHP: 2600, baseAttack: 155, baseDefense: 60, baseSpeed: 20,
    expReward: 1000, goldReward: 700,
    description: 'Boss tầng 35 - Vua Hydra.', isBoss: true
  },
  {
    id: 'boss_dragon', name: 'Rồng Lửa', emoji: '🐉',
    baseLevel: 40, baseHP: 3000, baseAttack: 170, baseDefense: 70, baseSpeed: 25,
    expReward: 1200, goldReward: 850,
    description: 'Boss tầng 40 - Rồng lửa hùng mạnh.', isBoss: true
  },
  {
    id: 'boss_shadow_king', name: 'Vua Bóng Tối', emoji: '🌑',
    baseLevel: 45, baseHP: 3500, baseAttack: 190, baseDefense: 80, baseSpeed: 35,
    expReward: 1500, goldReward: 1000,
    description: 'Boss tầng 45 - Vua bóng tối, cực nhanh.', isBoss: true
  },
  {
    id: 'boss_reaper', name: 'Thần Chết', emoji: '💀',
    baseLevel: 50, baseHP: 4000, baseAttack: 210, baseDefense: 90, baseSpeed: 38,
    expReward: 1800, goldReward: 1200,
    description: 'Boss tầng 50 - Thần chết gặt mạng.', isBoss: true
  },
  {
    id: 'boss_void_emperor', name: 'Hoàng Đế Hư Không', emoji: '🕳️',
    baseLevel: 55, baseHP: 4800, baseAttack: 240, baseDefense: 100, baseSpeed: 30,
    expReward: 2200, goldReward: 1500,
    description: 'Boss tầng 55 - Hoàng đế hư không.', isBoss: true
  },
  {
    id: 'boss_chaos_lord', name: 'Chúa Tể Hỗn Độn', emoji: '🌀',
    baseLevel: 60, baseHP: 5600, baseAttack: 270, baseDefense: 110, baseSpeed: 35,
    expReward: 2800, goldReward: 2000,
    description: 'Boss tầng 60 - Chúa tể hỗn độn.', isBoss: true
  },
  {
    id: 'boss_time_king', name: 'Vua Thời Gian', emoji: '⏰',
    baseLevel: 65, baseHP: 6400, baseAttack: 300, baseDefense: 120, baseSpeed: 40,
    expReward: 3500, goldReward: 2500,
    description: 'Boss tầng 65 - Vua kiểm soát thời gian.', isBoss: true
  },
  {
    id: 'boss_space_lord', name: 'Chúa Tể Không Gian', emoji: '🌌',
    baseLevel: 70, baseHP: 7200, baseAttack: 330, baseDefense: 130, baseSpeed: 35,
    expReward: 4200, goldReward: 3000,
    description: 'Boss tầng 70 - Chúa tể không gian.', isBoss: true
  },
  {
    id: 'boss_destiny', name: 'Số Mệnh', emoji: '⚖️',
    baseLevel: 75, baseHP: 8000, baseAttack: 360, baseDefense: 140, baseSpeed: 42,
    expReward: 5000, goldReward: 3500,
    description: 'Boss tầng 75 - Hiện thân số mệnh.', isBoss: true
  },
  {
    id: 'boss_god_slayer', name: 'Thần Sát', emoji: '⚡',
    baseLevel: 80, baseHP: 10000, baseAttack: 420, baseDefense: 160, baseSpeed: 45,
    expReward: 6000, goldReward: 4500,
    description: 'Boss tầng 80 - Sát thần, cực nhanh.', isBoss: true
  },
  {
    id: 'boss_abyss_king', name: 'Vua Vực Thẳm', emoji: '🕳️',
    baseLevel: 85, baseHP: 12000, baseAttack: 480, baseDefense: 180, baseSpeed: 38,
    expReward: 7500, goldReward: 5500,
    description: 'Boss tầng 85 - Vua vực thẳm.', isBoss: true
  },
  {
    id: 'boss_eternal', name: 'Bất Tử', emoji: '♾️',
    baseLevel: 90, baseHP: 14000, baseAttack: 540, baseDefense: 200, baseSpeed: 48,
    expReward: 9000, goldReward: 7000,
    description: 'Boss tầng 90 - Sinh vật bất tử.', isBoss: true
  },
  {
    id: 'boss_final', name: 'Kẻ Hủy Diệt', emoji: '💀',
    baseLevel: 95, baseHP: 20000, baseAttack: 630, baseDefense: 230, baseSpeed: 45,
    expReward: 15000, goldReward: 10000,
    description: 'Boss tầng 95 - Kẻ hủy diệt thế giới.', isBoss: true
  },
  {
    id: 'boss_supreme', name: 'Tối Thượng', emoji: '👑',
    baseLevel: 100, baseHP: 32000, baseAttack: 800, baseDefense: 280, baseSpeed: 55,
    expReward: 30000, goldReward: 20000,
    description: 'Boss tầng 100 - Vua tối thượng, kết thúc.', isBoss: true
  }
];

export function createMonster(template: MonsterTemplate, floorLevel: number): Monster {
  const scaling = 1 + (floorLevel - template.baseLevel) * 0.18;
  const level = Math.max(template.baseLevel, floorLevel);
  
  return {
    id: template.id,
    name: template.name,
    emoji: template.emoji,
    level: level,
    hp: Math.floor(template.baseHP * scaling),
    maxHP: Math.floor(template.baseHP * scaling),
    attack: Math.floor(template.baseAttack * scaling),
    defense: Math.floor(template.baseDefense * scaling),
    speed: template.baseSpeed + Math.floor(floorLevel / 5),
    expReward: Math.floor(template.expReward * scaling),
    goldReward: Math.floor(template.goldReward * scaling),
    description: template.description,
    isBoss: template.isBoss
  };
}

export function getMonstersForFloor(floor: number): MonsterTemplate[] {
  if (floor % 5 === 0 && floor >= 5) {
    const bosses = MONSTER_TEMPLATES.filter(m => m.isBoss);
    const bossIndex = Math.min(Math.floor(floor / 5) - 1, bosses.length - 1);
    return [bosses[bossIndex]];
  }
  
  return MONSTER_TEMPLATES.filter(m => !m.isBoss && m.baseLevel <= floor + 2 && m.baseLevel >= floor - 5);
}

export function getRandomMonster(floor: number): Monster {
  const available = getMonstersForFloor(floor);
  const template = available[Math.floor(Math.random() * available.length)];
  return createMonster(template, floor);
}

export const BOSS_FLOORS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

export function getMonsterCount(floor: number): number {
  if (floor < 20) return 1;
  if (floor % 5 === 0) return 1;
  const maxMonsters = Math.min(6, 2 + Math.floor((floor - 20) / 10));
  const chance = 0.3 + (floor - 20) * 0.015;
  if (Math.random() < chance) {
    return Math.min(maxMonsters, 2 + Math.floor(Math.random() * (maxMonsters - 1)));
  }
  return 1;
}

export function getMultipleRandomMonsters(floor: number): Monster[] {
  const count = getMonsterCount(floor);
  const monsters: Monster[] = [];
  for (let i = 0; i < count; i++) {
    monsters.push(getRandomMonster(floor));
  }
  return monsters;
}
