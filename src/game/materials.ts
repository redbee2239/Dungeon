import { Item } from './items';

export const MATERIALS: Record<string, Item> = {
  // Tier 1 - Common
  iron_ore: {
    id: 'iron_ore', name: 'Quặng Sắt', emoji: '⛏️',
    type: 'potion', rarity: 'common',
    description: 'Quặng sắt thô từ các mỏ.',
    price: 15, sellPrice: 6
  },
  wood: {
    id: 'wood', name: 'Gỗ', emoji: '🪵',
    type: 'potion', rarity: 'common',
    description: 'Gỗ thường từ rừng.',
    price: 10, sellPrice: 4
  },
  herb: {
    id: 'herb', name: 'Thảo Dược', emoji: '🌿',
    type: 'potion', rarity: 'common',
    description: 'Thảo dược thông thường.',
    price: 8, sellPrice: 3
  },
  leather: {
    id: 'leather', name: 'Da', emoji: '🟤',
    type: 'potion', rarity: 'common',
    description: 'Da thuộc từ thú.',
    price: 12, sellPrice: 5
  },
  bone: {
    id: 'bone', name: 'Xương', emoji: '🦴',
    type: 'potion', rarity: 'common',
    description: 'Xương từ quái vật.',
    price: 10, sellPrice: 4
  },

  // Tier 2 - Uncommon
  gold_ore: {
    id: 'gold_ore', name: 'Quặng Vàng', emoji: '✨',
    type: 'potion', rarity: 'uncommon',
    description: 'Quặng sáng bóng.',
    price: 40, sellPrice: 18
  },
  hardwood: {
    id: 'hardwood', name: 'Gỗ Cứng', emoji: '🪓',
    type: 'potion', rarity: 'uncommon',
    description: 'Gỗ cứng chắc chắn.',
    price: 35, sellPrice: 15
  },
  magic_dust: {
    id: 'magic_dust', name: 'Bụi Phép', emoji: '✨',
    type: 'potion', rarity: 'uncommon',
    description: 'Bụi phép thuật từ kẻ thù ma thuật.',
    price: 50, sellPrice: 22
  },
  rare_herb: {
    id: 'rare_herb', name: 'Thảo Dược Quý', emoji: '🌸',
    type: 'potion', rarity: 'uncommon',
    description: 'Thảo dược hiếm.',
    price: 45, sellPrice: 20
  },
  steel_ingot: {
    id: 'steel_ingot', name: 'Thép', emoji: '🔩',
    type: 'potion', rarity: 'uncommon',
    description: 'Thỏi thép bền chắc.',
    price: 60, sellPrice: 28
  },
  cloth: {
    id: 'cloth', name: 'Vải', emoji: '🧵',
    type: 'potion', rarity: 'uncommon',
    description: 'Vải dày dùng may giáp.',
    price: 30, sellPrice: 12
  },

  // Tier 3 - Rare
  mithril_ore: {
    id: 'mithril_ore', name: 'Quặng Mithril', emoji: '💎',
    type: 'potion', rarity: 'rare',
    description: 'Quặng mithril quý hiếm.',
    price: 150, sellPrice: 70
  },
  soul_shard: {
    id: 'soul_shard', name: 'Mảnh Linh Hồn', emoji: '👻',
    type: 'potion', rarity: 'rare',
    description: 'Mảnh linh hồn từ boss.',
    price: 200, sellPrice: 90
  },
  mithril_ingot: {
    id: 'mithril_ingot', name: 'Thỏi Mithril', emoji: '💠',
    type: 'potion', rarity: 'rare',
    description: 'Thỏi mithril lấp lánh.',
    price: 300, sellPrice: 140
  },
  arcane_crystal: {
    id: 'arcane_crystal', name: 'Tinh Thể Phép', emoji: '🔮',
    type: 'potion', rarity: 'rare',
    description: 'Tinh thể tích trữ ma thuật.',
    price: 250, sellPrice: 110
  },
  shadow_silk: {
    id: 'shadow_silk', name: 'Tơ Bóng Tối', emoji: '🕸️',
    type: 'potion', rarity: 'rare',
    description: 'Tơ nhện bóng tối cực mịn.',
    price: 180, sellPrice: 80
  },
  starstone: {
    id: 'starstone', name: 'Đá Sao', emoji: '⭐',
    type: 'potion', rarity: 'rare',
    description: 'Đá phát sáng từ bầu trời.',
    price: 220, sellPrice: 100
  },

  // Tier 4 - Epic
  dragon_scale_mat: {
    id: 'dragon_scale_mat', name: 'Vảy Rồng', emoji: '🐲',
    type: 'potion', rarity: 'epic',
    description: 'Vảy rồng cực kỳ cứng.',
    price: 500, sellPrice: 250
  },
  demon_horn: {
    id: 'demon_horn', name: 'Sừng Quỷ', emoji: '😈',
    type: 'potion', rarity: 'epic',
    description: 'Sừng của ác quỷ.',
    price: 500, sellPrice: 250
  },
  phoenix_feather: {
    id: 'phoenix_feather', name: 'Lông Phượng Hoàng', emoji: '🔥',
    type: 'potion', rarity: 'epic',
    description: 'Lông phát lửa của Phượng Hoàng.',
    price: 600, sellPrice: 300
  },
  void_essence: {
    id: 'void_essence', name: 'Tinh Hoa Hư Không', emoji: '🌀',
    type: 'potion', rarity: 'epic',
    description: 'Năng lượng từ hư không.',
    price: 550, sellPrice: 270
  },
  celestial_iron: {
    id: 'celestial_iron', name: 'Sắt Thiên Thạch', emoji: '☄️',
    type: 'potion', rarity: 'epic',
    description: 'Sắt từ thiên thạch rơi.',
    price: 700, sellPrice: 350
  },

  // Tier 5 - Legendary
  eternal_gem: {
    id: 'eternal_gem', name: 'Ngọc Vĩnh Cửu', emoji: '🌟',
    type: 'potion', rarity: 'legendary',
    description: 'Ngọc phát sáng vĩnh cửu.',
    price: 2000, sellPrice: 1000
  },
  abyssal_core: {
    id: 'abyssal_core', name: 'Lõi Địa Ngục', emoji: '💀',
    type: 'potion', rarity: 'legendary',
    description: 'Lõi năng lượng từ địa ngục.',
    price: 2500, sellPrice: 1200
  },
  world_tree_sap: {
    id: 'world_tree_sap', name: 'Mủ Cây Thế Giới', emoji: '🌳',
    type: 'potion', rarity: 'legendary',
    description: 'Mủ từ Cây Thế Giới.',
    price: 2200, sellPrice: 1100
  },
  crystalized_light: {
    id: 'crystalized_light', name: 'Ánh Sáng Tinh Thể', emoji: '💫',
    type: 'potion', rarity: 'legendary',
    description: 'Ánh sáng được cô đọng.',
    price: 2300, sellPrice: 1150
  }
};

export function getMaterialById(id: string): Item | undefined {
  return MATERIALS[id];
}
