export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Pet {
  id: string;
  name: string;
  emoji: string;
  rarity: PetRarity;
  description: string;
  bonus: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    speed?: number;
    crit?: number;
    summonBoost?: number;
  };
}

export const PET_RARITY_WEIGHTS: Record<PetRarity, number> = {
  common: 45,
  uncommon: 30,
  rare: 15,
  epic: 7,
  legendary: 3
};

export const PET_RARITY_NAMES: Record<PetRarity, string> = {
  common: 'Phổ Thông',
  uncommon: 'Khổng Lồ',
  rare: 'Hiếm',
  epic: 'Sử Thi',
  legendary: 'Huyền Thoại'
};

export const PET_RARITY_COLORS: Record<PetRarity, number> = {
  common: 0xAAAAAA,
  uncommon: 0x00FF00,
  rare: 0x0099FF,
  epic: 0xAA00FF,
  legendary: 0xFF8800
};

export const PET_GACHA_COST = 100;

export const PETS: Pet[] = [
  // Common
  { id: 'pet_mouse', name: 'Chuột', emoji: '🐭', rarity: 'common', description: 'Nhỏ nhưng nhanh.', bonus: { speed: 2 } },
  { id: 'pet_cat', name: 'Mèo', emoji: '🐱', rarity: 'common', description: 'Đáng yêu, linh hoạt.', bonus: { speed: 3, attack: 1 } },
  { id: 'pet_chicken', name: 'Gà', emoji: '🐔', rarity: 'common', description: 'Chỉ biết gáy.', bonus: { hp: 10 } },
  { id: 'pet_dog', name: 'Chó', emoji: '🐶', rarity: 'common', description: 'Trung thành.', bonus: { attack: 2, defense: 1 } },
  { id: 'pet_frog', name: 'Ếch', emoji: '🐸', rarity: 'common', description: 'Nhảy giỏi.', bonus: { speed: 4 } },
  { id: 'pet_pig', name: 'Lợn', emoji: '🐷', rarity: 'common', description: 'Mập nhưng sturdy.', bonus: { hp: 15, defense: 1 } },

  // Uncommon
  { id: 'pet_fox', name: 'Cáo', emoji: '🦊', rarity: 'uncommon', description: 'Khôn ngoan và nhanh nhẹn.', bonus: { speed: 5, crit: 2 } },
  { id: 'pet_rabbit', name: 'Thỏ', emoji: '🐰', rarity: 'uncommon', description: 'Nhanh như chớp.', bonus: { speed: 6, hp: 10 } },
  { id: 'pet_penguin', name: 'Chim Cánh Cụt', emoji: '🐧', rarity: 'uncommon', description: 'Mặc áo vest đi chơi.', bonus: { defense: 4, hp: 15 } },
  { id: 'pet_bear', name: 'Gấu Con', emoji: '🧸', rarity: 'uncommon', description: 'Teddy bear mạnh mẽ.', bonus: { attack: 5, hp: 20 } },
  { id: 'pet_panda', name: 'Gấu Trúc', emoji: '🐼', rarity: 'uncommon', description: 'Đáng yêu nhưng mạnh.', bonus: { attack: 4, defense: 3 } },

  // Rare
  { id: 'pet_wolf', name: 'Sói', emoji: '🐺', rarity: 'rare', description: 'Sói hoang dã, tấn công mạnh.', bonus: { attack: 8, speed: 4 } },
  { id: 'pet_eagle', name: 'Đại Bàng', emoji: '🦅', rarity: 'rare', description: 'Bay cao, nhìn xa.', bonus: { crit: 8, speed: 5 } },
  { id: 'pet_lion', name: 'Sư Tử', emoji: '🦁', rarity: 'rare', description: 'Vua rừng plains.', bonus: { attack: 10, defense: 3 } },
  { id: 'pet_turtle', name: 'Rùa', emoji: '🐢', rarity: 'rare', description: 'Chậm nhưng chắc.', bonus: { defense: 10, hp: 30 } },
  { id: 'pet_phoenix_chick', name: 'Phượng Hoàng Con', emoji: '🐤', rarity: 'rare', description: 'Tuition từ phượng hoàng.', bonus: { attack: 6, mp: 20 } },

  // Epic
  { id: 'pet_dragon_whelp', name: 'Rồng Con', emoji: '🐲', rarity: 'epic', description: 'Tiềm năng vô hạn.', bonus: { attack: 12, defense: 5, hp: 25 } },
  { id: 'pet_griffin', name: 'Griffin', emoji: '🦒', rarity: 'epic', description: 'Nửa sư tử, nửa đại bàng.', bonus: { attack: 10, speed: 8, crit: 5 } },
  { id: 'pet_kitsune', name: 'Kitsune', emoji: '🦊', rarity: 'epic', description: 'Cáo 9 đuôi, phép thuật mạnh.', bonus: { mp: 50, attack: 8, speed: 6 } },
  { id: 'pet_unicorn', name: 'Kỳ Lân', emoji: '🦄', rarity: 'epic', description: 'Sức mạnh thần thánh.', bonus: { hp: 40, mp: 30, defense: 6 } },

  // Legendary
  { id: 'pet_dragon', name: 'Rồng', emoji: '🐉', rarity: 'legendary', description: 'Vua của tất cả rồng.', bonus: { attack: 20, defense: 10, hp: 50, speed: 5 } },
  { id: 'pet_phoenix', name: 'Phượng Hoàng', emoji: '🔥', rarity: 'legendary', description: 'Tái sinh từ tro tàn.', bonus: { attack: 15, mp: 60, speed: 10, crit: 8 } },
  { id: 'pet_celestial', name: 'Thiên Thần', emoji: '👼', rarity: 'legendary', description: 'Sức mạnh từ trời.', bonus: { hp: 60, mp: 40, attack: 12, defense: 12 } },
  { id: 'pet_demon', name: 'Ác Quỷ', emoji: '👹', rarity: 'legendary', description: 'Sức mạnh bóng tối.', bonus: { attack: 25, speed: 8, crit: 10 } },
];

export function rollPet(): Pet {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedRarity: PetRarity = 'common';

  for (const [rarity, weight] of Object.entries(PET_RARITY_WEIGHTS) as [PetRarity, number][]) {
    cumulative += weight;
    if (rand < cumulative) {
      selectedRarity = rarity;
      break;
    }
  }

  const petsOfRarity = PETS.filter(p => p.rarity === selectedRarity);
  return petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)];
}

export function rollPetWithPity(pityCount: number): { pet: Pet; newPity: number } {
  let guaranteedRarity: PetRarity | null = null;

  if (pityCount >= 80) {
    guaranteedRarity = 'legendary';
  } else if (pityCount >= 40) {
    guaranteedRarity = 'epic';
  }

  if (guaranteedRarity) {
    const petsOfRarity = PETS.filter(p => p.rarity === guaranteedRarity);
    return { pet: petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)], newPity: 0 };
  }

  const pet = rollPet();
  const newPity = pet.rarity === 'legendary' || pet.rarity === 'epic' ? 0 : pityCount + 1;
  return { pet, newPity };
}
