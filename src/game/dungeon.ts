export interface DungeonFloor {
  floor: number;
  name: string;
  description: string;
  monsterCount: number;
  hasChest: boolean;
  hasShop: boolean;
  bossFloor: boolean;
}

export interface DungeonState {
  userId: string;
  currentFloor: number;
  roomsExplored: number;
  monstersDefeated: number;
  isActive: boolean;
  startTime: number;
}

export const FLOOR_NAMES: Record<number, string> = {
  1: 'Đầm Lầy Bắt Đầu',
  2: 'Hang Động Tối Tăm',
  3: 'Lăng Mộ Bỏ Hoang',
  4: 'Rừng Chết',
  5: 'Cung Điện Goblin',
  6: 'Tháp Phép Thuật',
  7: 'Hang Rồng',
  8: 'Đồng Tử Vong',
  9: 'Cung Điện Bóng Tối',
  10: 'Đỉnh Thế Giới',
  11: 'Vực Sâu Vĩnh Cửu',
  12: 'Địa Ngục',
  13: 'Cung Điện Lich',
  14: 'Rừng Ma Quái',
  15: 'Thế Giới Rồng'
};

export const FLOOR_DESCRIPTIONS: Record<number, string> = {
  1: 'Nơi bắt đầu hành trình, đầy slime và côn trùng.',
  2: 'Bóng tối bao trùm, tiếng nước nhỏ giọt.',
  3: 'Xác sống lang thang, mùi xác thối.',
  4: 'Cây cối héo úa, quái vật ẩn nấp.',
  5: 'Cung điện của Vua Goblin, kẻ thù mạnh.',
  6: 'Phép thuật trôi nổi, nguy hiểm khắp nơi.',
  7: 'Nơi ẩn náu của loài rồng, cực kỳ nguy hiểm.',
  8: 'Bước chân ai cũng có thể chết.',
  9: 'Bóng tối hoàn toàn, kẻ thù bất ngờ.',
  10: 'Đỉnh cao của dungeon, thử thách cuối.',
  11: 'Vực sâu không đáy, quái vật cổ đại.',
  12: 'Địa ngục thực sự, chỉ kẻ mạnh nhất sống sót.',
  13: 'Cung điện của Lich King, undead hùng mạnh.',
  14: 'Rừng ma quái, quái vật ẩn nấp mọi nơi.',
  15: 'Thế giới của rồng, thử thách cuối cùng.'
};

export function createDungeonState(userId: string): DungeonState {
  return {
    userId,
    currentFloor: 1,
    roomsExplored: 0,
    monstersDefeated: 0,
    isActive: false,
    startTime: 0
  };
}

export function getFloorInfo(floor: number): DungeonFloor {
  const name = FLOOR_NAMES[floor] || `Tầng ${floor}`;
  const description = FLOOR_DESCRIPTIONS[floor] || 'Hầm ngục bí ẩn.';
  const bossFloor = floor % 5 === 0;
  
  return {
    floor,
    name,
    description,
    monsterCount: bossFloor ? 1 : 3 + Math.floor(Math.random() * 3),
    hasChest: Math.random() > 0.4,
    hasShop: !bossFloor && Math.random() > 0.6,
    bossFloor
  };
}
