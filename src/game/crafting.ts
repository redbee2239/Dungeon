import { Player } from './database';
import { ITEMS, Item } from './items';
import { MATERIALS } from './materials';
import { addItem, hasItem, removeItem, getItemCount } from './inventory';

export interface CraftingRecipe {
  id: string;
  name: string;
  emoji: string;
  result: string;
  resultQuantity: number;
  materials: { itemId: string; quantity: number }[];
  goldCost: number;
}

export const RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_wooden_sword', name: 'Kiếm Gỗ', emoji: '🗡️',
    result: 'wooden_sword', resultQuantity: 1,
    materials: [{ itemId: 'wood', quantity: 5 }],
    goldCost: 20
  },
  {
    id: 'craft_staff', name: 'Gậy Gỗ', emoji: '🪄',
    result: 'magic_wand', resultQuantity: 1,
    materials: [{ itemId: 'wood', quantity: 4 }, { itemId: 'herb', quantity: 2 }],
    goldCost: 25
  },
  {
    id: 'craft_iron_blade', name: 'Lưỡi Sắt', emoji: '⚔️',
    result: 'iron_sword', resultQuantity: 1,
    materials: [{ itemId: 'iron_ore', quantity: 6 }, { itemId: 'wood', quantity: 3 }],
    goldCost: 60
  },
  {
    id: 'craft_oak_staff', name: 'Gậy Sồi', emoji: '🪄',
    result: 'oak_staff', resultQuantity: 1,
    materials: [{ itemId: 'hardwood', quantity: 5 }, { itemId: 'magic_dust', quantity: 2 }],
    goldCost: 50
  },
  {
    id: 'craft_mithril_blade', name: 'Lưỡi Mithril', emoji: '⚔️',
    result: 'mithril_armor', resultQuantity: 1,
    materials: [{ itemId: 'mithril_ore', quantity: 8 }, { itemId: 'iron_ore', quantity: 4 }],
    goldCost: 350
  },
  {
    id: 'craft_iron_shield', name: 'Khiên Sắt', emoji: '🛡️',
    result: 'chain_mail', resultQuantity: 1,
    materials: [{ itemId: 'iron_ore', quantity: 8 }, { itemId: 'wood', quantity: 4 }],
    goldCost: 100
  },
  {
    id: 'craft_mage_robe', name: 'Áo Choàng Pháp Sư', emoji: '🧙',
    result: 'mage_robe', resultQuantity: 1,
    materials: [{ itemId: 'magic_dust', quantity: 5 }, { itemId: 'rare_herb', quantity: 3 }],
    goldCost: 120
  },
  {
    id: 'craft_ring_of_power', name: 'Nhẫn Sức Mạnh', emoji: '💍',
    result: 'power_amulet', resultQuantity: 1,
    materials: [{ itemId: 'gold_ore', quantity: 6 }, { itemId: 'soul_shard', quantity: 2 }],
    goldCost: 250
  },
  {
    id: 'craft_amulet_of_life', name: 'Dây Chuyền Sự Sống', emoji: '📿',
    result: 'life_pendant', resultQuantity: 1,
    materials: [{ itemId: 'rare_herb', quantity: 5 }, { itemId: 'soul_shard', quantity: 3 }],
    goldCost: 300
  },
  {
    id: 'craft_mega_health', name: 'Bình Máu Lớn', emoji: '🧪',
    result: 'mega_health', resultQuantity: 3,
    materials: [{ itemId: 'herb', quantity: 6 }, { itemId: 'rare_herb', quantity: 3 }, { itemId: 'dragon_scale_mat', quantity: 1 }],
    goldCost: 150
  }
];

export function findRecipe(id: string): CraftingRecipe | undefined {
  return RECIPES.find(r => r.id === id);
}

function getMaterialName(id: string): string {
  if (ITEMS[id]) return ITEMS[id].name;
  if (MATERIALS[id]) return MATERIALS[id].name;
  return id;
}

export function canCraft(player: Player, recipe: CraftingRecipe): { ok: boolean; missing: string } {
  if (player.stats.gold < recipe.goldCost) {
    return { ok: false, missing: `Không đủ gold (cần ${recipe.goldCost})` };
  }
  for (const mat of recipe.materials) {
    if (!hasItem(player.inventory, mat.itemId, mat.quantity)) {
      const have = getItemCount(player.inventory, mat.itemId);
      return { ok: false, missing: `Thiếu ${getMaterialName(mat.itemId)} (cần ${mat.quantity}, có ${have})` };
    }
  }
  return { ok: true, missing: '' };
}

export function craftItem(player: Player, recipe: CraftingRecipe): { success: boolean; message: string; item?: Item } {
  const check = canCraft(player, recipe);
  if (!check.ok) return { success: false, message: check.missing };

  for (const mat of recipe.materials) {
    removeItem(player.inventory, mat.itemId, mat.quantity);
  }
  player.stats.gold -= recipe.goldCost;

  const resultItem = ITEMS[recipe.result];
  if (!resultItem) return { success: false, message: 'Lỗi vật phẩm kết quả!' };

  const addResult = addItem(player.inventory, resultItem, recipe.resultQuantity);
  if (!addResult.success) return { success: false, message: addResult.message };

  return {
    success: true,
    message: `Đã chế tạo **${recipe.name}** thành công! (-${recipe.goldCost} Gold)`,
    item: resultItem
  };
}
