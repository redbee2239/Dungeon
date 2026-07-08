import { Item } from './items';

export const MATERIALS: Record<string, Item> = {
  iron_ore: {
    id: 'iron_ore', name: 'Quặng Sắt', emoji: '⛏️',
    type: 'potion', rarity: 'common',
    description: 'Quặng sắt thô từ các mỏ.',
    price: 15, sellPrice: 6
  },
  gold_ore: {
    id: 'gold_ore', name: 'Quặng Vàng', emoji: '✨',
    type: 'potion', rarity: 'uncommon',
    description: 'Quặng sáng bóng.',
    price: 40, sellPrice: 18
  },
  mithril_ore: {
    id: 'mithril_ore', name: 'Quặng Mithril', emoji: '💎',
    type: 'potion', rarity: 'rare',
    description: 'Quặng mithril quý hiếm.',
    price: 150, sellPrice: 70
  },
  wood: {
    id: 'wood', name: 'Gỗ', emoji: '🪵',
    type: 'potion', rarity: 'common',
    description: 'Gỗ thường từ rừng.',
    price: 10, sellPrice: 4
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
  soul_shard: {
    id: 'soul_shard', name: 'Mảnh Linh Hồn', emoji: '👻',
    type: 'potion', rarity: 'rare',
    description: 'Mảnh linh hồn từ boss.',
    price: 200, sellPrice: 90
  },
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
  herb: {
    id: 'herb', name: 'Thảo Dược', emoji: '🌿',
    type: 'potion', rarity: 'common',
    description: 'Thảo dược thông thường.',
    price: 8, sellPrice: 3
  },
  rare_herb: {
    id: 'rare_herb', name: 'Thảo Dược Quý', emoji: '🌸',
    type: 'potion', rarity: 'uncommon',
    description: 'Thảo dược hiếm.',
    price: 45, sellPrice: 20
  }
};

export function getMaterialById(id: string): Item | undefined {
  return MATERIALS[id];
}
