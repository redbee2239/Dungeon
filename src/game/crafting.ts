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
  category: 'material' | 'weapon' | 'armor' | 'accessory' | 'potion';
}

export const RECIPES: CraftingRecipe[] = [
  // === MATERIAL CRAFTING ===
  // Tier 1→2
  { id: 'craft_steel', name: 'Thép', emoji: '🔩', result: 'steel_ingot', resultQuantity: 1, materials: [{ itemId: 'iron_ore', quantity: 3 }], goldCost: 20, category: 'material' },
  { id: 'craft_hardwood', name: 'Gỗ Cứng', emoji: '🪓', result: 'hardwood', resultQuantity: 1, materials: [{ itemId: 'wood', quantity: 4 }], goldCost: 15, category: 'material' },
  { id: 'craft_cloth', name: 'Vải', emoji: '🧵', result: 'cloth', resultQuantity: 1, materials: [{ itemId: 'herb', quantity: 3 }, { itemId: 'leather', quantity: 2 }], goldCost: 18, category: 'material' },

  // Tier 2→3
  { id: 'craft_mithril_ingot', name: 'Thỏi Mithril', emoji: '💠', result: 'mithril_ingot', resultQuantity: 1, materials: [{ itemId: 'mithril_ore', quantity: 2 }, { itemId: 'steel_ingot', quantity: 2 }], goldCost: 80, category: 'material' },
  { id: 'craft_arcane_crystal', name: 'Tinh Thể Phép', emoji: '🔮', result: 'arcane_crystal', resultQuantity: 1, materials: [{ itemId: 'magic_dust', quantity: 5 }, { itemId: 'soul_shard', quantity: 1 }], goldCost: 100, category: 'material' },
  { id: 'craft_shadow_silk', name: 'Tơ Bóng Tối', emoji: '🕸️', result: 'shadow_silk', resultQuantity: 1, materials: [{ itemId: 'cloth', quantity: 3 }, { itemId: 'soul_shard', quantity: 2 }], goldCost: 90, category: 'material' },
  { id: 'craft_starstone', name: 'Đá Sao', emoji: '⭐', result: 'starstone', resultQuantity: 1, materials: [{ itemId: 'gold_ore', quantity: 3 }, { itemId: 'arcane_crystal', quantity: 1 }], goldCost: 110, category: 'material' },

  // Tier 3→4
  { id: 'craft_celestial_iron', name: 'Sắt Thiên Thạch', emoji: '☄️', result: 'celestial_iron', resultQuantity: 1, materials: [{ itemId: 'mithril_ingot', quantity: 2 }, { itemId: 'starstone', quantity: 2 }, { itemId: 'dragon_scale_mat', quantity: 1 }], goldCost: 300, category: 'material' },
  { id: 'craft_phoenix_feather', name: 'Lông Phượng Hoàng', emoji: '🔥', result: 'phoenix_feather', resultQuantity: 1, materials: [{ itemId: 'dragon_scale_mat', quantity: 2 }, { itemId: 'soul_shard', quantity: 3 }, { itemId: 'rare_herb', quantity: 2 }], goldCost: 350, category: 'material' },
  { id: 'craft_void_essence', name: 'Tinh Hoa Hư Không', emoji: '🌀', result: 'void_essence', resultQuantity: 1, materials: [{ itemId: 'demon_horn', quantity: 2 }, { itemId: 'soul_shard', quantity: 3 }, { itemId: 'magic_dust', quantity: 4 }], goldCost: 320, category: 'material' },

  // Tier 4→5
  { id: 'craft_eternal_gem', name: 'Ngọc Vĩnh Cửu', emoji: '🌟', result: 'eternal_gem', resultQuantity: 1, materials: [{ itemId: 'celestial_iron', quantity: 2 }, { itemId: 'phoenix_feather', quantity: 2 }, { itemId: 'void_essence', quantity: 2 }, { itemId: 'starstone', quantity: 3 }], goldCost: 800, category: 'material' },
  { id: 'craft_abyssal_core', name: 'Lõi Địa Ngục', emoji: '💀', result: 'abyssal_core', resultQuantity: 1, materials: [{ itemId: 'demon_horn', quantity: 3 }, { itemId: 'void_essence', quantity: 2 }, { itemId: 'soul_shard', quantity: 4 }], goldCost: 900, category: 'material' },
  { id: 'craft_world_tree_sap', name: 'Mủ Cây Thế Giới', emoji: '🌳', result: 'world_tree_sap', resultQuantity: 1, materials: [{ itemId: 'rare_herb', quantity: 5 }, { itemId: 'phoenix_feather', quantity: 1 }, { itemId: 'starstone', quantity: 2 }], goldCost: 850, category: 'material' },
  { id: 'craft_crystalized_light', name: 'Ánh Sáng Tinh Thể', emoji: '💫', result: 'crystalized_light', resultQuantity: 1, materials: [{ itemId: 'starstone', quantity: 3 }, { itemId: 'arcane_crystal', quantity: 3 }, { itemId: 'phoenix_feather', quantity: 1 }], goldCost: 880, category: 'material' },

  // === COMMON WEAPONS ===
  { id: 'craft_wooden_sword', name: 'Kiếm Gỗ', emoji: '🗡️', result: 'wooden_sword', resultQuantity: 1, materials: [{ itemId: 'wood', quantity: 5 }], goldCost: 20, category: 'weapon' },
  { id: 'craft_staff', name: 'Gậy Gỗ', emoji: '🪄', result: 'magic_wand', resultQuantity: 1, materials: [{ itemId: 'wood', quantity: 4 }, { itemId: 'herb', quantity: 2 }], goldCost: 25, category: 'weapon' },
  { id: 'craft_bone_club', name: 'Gậy Xương', emoji: '🦴', result: 'bone_club', resultQuantity: 1, materials: [{ itemId: 'bone', quantity: 6 }, { itemId: 'leather', quantity: 2 }], goldCost: 30, category: 'weapon' },

  // === UNCOMMON WEAPONS ===
  { id: 'craft_iron_blade', name: 'Lưỡi Sắt', emoji: '⚔️', result: 'iron_sword', resultQuantity: 1, materials: [{ itemId: 'steel_ingot', quantity: 3 }, { itemId: 'wood', quantity: 2 }], goldCost: 80, category: 'weapon' },
  { id: 'craft_oak_staff', name: 'Gậy Sồi', emoji: '🪄', result: 'oak_staff', resultQuantity: 1, materials: [{ itemId: 'hardwood', quantity: 4 }, { itemId: 'magic_dust', quantity: 3 }], goldCost: 90, category: 'weapon' },
  { id: 'craft_hunting_bow', name: 'Cung Săn', emoji: '🏹', result: 'hunting_bow', resultQuantity: 1, materials: [{ itemId: 'hardwood', quantity: 3 }, { itemId: 'leather', quantity: 4 }], goldCost: 85, category: 'weapon' },
  { id: 'craft_gladius', name: 'Gladius', emoji: '🗡️', result: 'gladius', resultQuantity: 1, materials: [{ itemId: 'steel_ingot', quantity: 4 }, { itemId: 'leather', quantity: 2 }], goldCost: 100, category: 'weapon' },
  { id: 'craft_mage_staff', name: 'Gậy Pháp Sư', emoji: '🪄', result: 'mage_staff', resultQuantity: 1, materials: [{ itemId: 'hardwood', quantity: 3 }, { itemId: 'magic_dust', quantity: 4 }, { itemId: 'rare_herb', quantity: 2 }], goldCost: 110, category: 'weapon' },

  // === RARE WEAPONS ===
  { id: 'craft_mithril_blade', name: 'Lưỡi Mithril', emoji: '⚔️', result: 'mithril_blade', resultQuantity: 1, materials: [{ itemId: 'mithril_ingot', quantity: 3 }, { itemId: 'steel_ingot', quantity: 2 }, { itemId: 'hardwood', quantity: 2 }], goldCost: 400, category: 'weapon' },
  { id: 'craft_crystal_staff', name: 'Gậy Tinh Thể', emoji: '🔮', result: 'crystal_staff', resultQuantity: 1, materials: [{ itemId: 'arcane_crystal', quantity: 3 }, { itemId: 'mithril_ingot', quantity: 2 }, { itemId: 'soul_shard', quantity: 2 }], goldCost: 450, category: 'weapon' },
  { id: 'craft_shadow_dagger', name: 'Dao Bóng Tối', emoji: '🗡️', result: 'shadow_dagger', resultQuantity: 1, materials: [{ itemId: 'shadow_silk', quantity: 3 }, { itemId: 'mithril_ingot', quantity: 2 }, { itemId: 'soul_shard', quantity: 2 }], goldCost: 420, category: 'weapon' },
  { id: 'craft_starbow', name: 'Cung Sao', emoji: '🏹', result: 'starbow', resultQuantity: 1, materials: [{ itemId: 'starstone', quantity: 2 }, { itemId: 'hardwood', quantity: 3 }, { itemId: 'shadow_silk', quantity: 2 }], goldCost: 430, category: 'weapon' },
  { id: 'craft_battle_axe', name: 'Rìu Chiến', emoji: '🪓', result: 'battle_axe', resultQuantity: 1, materials: [{ itemId: 'mithril_ingot', quantity: 3 }, { itemId: 'wood', quantity: 3 }, { itemId: 'leather', quantity: 2 }], goldCost: 400, category: 'weapon' },

  // === EPIC WEAPONS ===
  { id: 'craft_dragon_sword', name: 'Kiếm Rồng', emoji: '🐲', result: 'dragon_sword', resultQuantity: 1, materials: [{ itemId: 'celestial_iron', quantity: 3 }, { itemId: 'dragon_scale_mat', quantity: 3 }, { itemId: 'phoenix_feather', quantity: 1 }, { itemId: 'mithril_ingot', quantity: 2 }], goldCost: 1200, category: 'weapon' },
  { id: 'craft_demon_blade', name: 'Lưỡi Daemon', emoji: '😈', result: 'demon_blade', resultQuantity: 1, materials: [{ itemId: 'celestial_iron', quantity: 3 }, { itemId: 'demon_horn', quantity: 3 }, { itemId: 'void_essence', quantity: 2 }, { itemId: 'soul_shard', quantity: 3 }], goldCost: 1300, category: 'weapon' },
  { id: 'craft_arcane_orb', name: 'Quả Cầu Huyền Bí', emoji: '🔮', result: 'arcane_orb', resultQuantity: 1, materials: [{ itemId: 'void_essence', quantity: 3 }, { itemId: 'arcane_crystal', quantity: 4 }, { itemId: 'phoenix_feather', quantity: 2 }], goldCost: 1400, category: 'weapon' },
  { id: 'craft_phoenix_bow', name: 'Cung Phượng Hoàng', emoji: '🔥', result: 'phoenix_bow', resultQuantity: 1, materials: [{ itemId: 'phoenix_feather', quantity: 3 }, { itemId: 'celestial_iron', quantity: 2 }, { itemId: 'starstone', quantity: 3 }], goldCost: 1350, category: 'weapon' },
  { id: 'craft_void_scythe', name: 'Liềm Hư Không', emoji: '🌀', result: 'void_scythe', resultQuantity: 1, materials: [{ itemId: 'void_essence', quantity: 4 }, { itemId: 'demon_horn', quantity: 2 }, { itemId: 'celestial_iron', quantity: 2 }, { itemId: 'soul_shard', quantity: 3 }], goldCost: 1500, category: 'weapon' },

  // === LEGENDARY WEAPONS ===
  { id: 'craft_excalibur', name: 'Excalibur', emoji: '⚔️', result: 'excalibur', resultQuantity: 1, materials: [{ itemId: 'eternal_gem', quantity: 2 }, { itemId: 'celestial_iron', quantity: 4 }, { itemId: 'phoenix_feather', quantity: 3 }, { itemId: 'crystalized_light', quantity: 2 }], goldCost: 5000, category: 'weapon' },
  { id: 'craft_staff_of_eternity', name: 'Gậy Vĩnh Cửu', emoji: '🌟', result: 'staff_of_eternity', resultQuantity: 1, materials: [{ itemId: 'world_tree_sap', quantity: 3 }, { itemId: 'eternal_gem', quantity: 2 }, { itemId: 'crystalized_light', quantity: 3 }, { itemId: 'arcane_crystal', quantity: 4 }], goldCost: 5500, category: 'weapon' },
  { id: 'craft_abyssal_fang', name: 'Nanh Địa Ngục', emoji: '💀', result: 'abyssal_fang', resultQuantity: 1, materials: [{ itemId: 'abyssal_core', quantity: 2 }, { itemId: 'demon_horn', quantity: 4 }, { itemId: 'void_essence', quantity: 3 }, { itemId: 'celestial_iron', quantity: 3 }], goldCost: 6000, category: 'weapon' },

  // === COMMON ARMOR ===
  { id: 'craft_leather_armor', name: 'Giáp Da', emoji: '🦺', result: 'leather_armor', resultQuantity: 1, materials: [{ itemId: 'leather', quantity: 5 }], goldCost: 30, category: 'armor' },

  // === UNCOMMON ARMOR ===
  { id: 'craft_chain_mail', name: 'Giáp Xích', emoji: '🛡️', result: 'chain_mail', resultQuantity: 1, materials: [{ itemId: 'steel_ingot', quantity: 4 }, { itemId: 'leather', quantity: 3 }], goldCost: 120, category: 'armor' },
  { id: 'craft_mage_robe', name: 'Áo Choàng Pháp Sư', emoji: '🧙', result: 'mage_robe', resultQuantity: 1, materials: [{ itemId: 'cloth', quantity: 4 }, { itemId: 'magic_dust', quantity: 3 }], goldCost: 110, category: 'armor' },
  { id: 'craft_rogue_vest', name: 'Áo Sát Thủ', emoji: '🗡️', result: 'rogue_vest', resultQuantity: 1, materials: [{ itemId: 'shadow_silk', quantity: 2 }, { itemId: 'leather', quantity: 3 }], goldCost: 100, category: 'armor' },

  // === RARE ARMOR ===
  { id: 'craft_mithril_armor', name: 'Giáp Mithril', emoji: '🛡️', result: 'mithril_armor', resultQuantity: 1, materials: [{ itemId: 'mithril_ingot', quantity: 4 }, { itemId: 'steel_ingot', quantity: 3 }, { itemId: 'leather', quantity: 2 }], goldCost: 500, category: 'armor' },
  { id: 'craft_arcane_robe', name: 'Áo Choàng Huyền Bí', emoji: '🔮', result: 'arcane_robe', resultQuantity: 1, materials: [{ itemId: 'arcane_crystal', quantity: 3 }, { itemId: 'shadow_silk', quantity: 3 }, { itemId: 'cloth', quantity: 2 }], goldCost: 480, category: 'armor' },
  { id: 'craft_shadow_cloak', name: 'Áo Khoác Bóng Tối', emoji: '🕸️', result: 'shadow_cloak', resultQuantity: 1, materials: [{ itemId: 'shadow_silk', quantity: 4 }, { itemId: 'soul_shard', quantity: 2 }, { itemId: 'cloth', quantity: 3 }], goldCost: 460, category: 'armor' },

  // === EPIC ARMOR ===
  { id: 'craft_dragon_plate', name: 'Giáp Rồng', emoji: '🐲', result: 'dragon_plate', resultQuantity: 1, materials: [{ itemId: 'dragon_scale_mat', quantity: 4 }, { itemId: 'celestial_iron', quantity: 3 }, { itemId: 'mithril_ingot', quantity: 3 }, { itemId: 'phoenix_feather', quantity: 1 }], goldCost: 2000, category: 'armor' },
  { id: 'craft_demon_armor', name: 'Giáp Daemon', emoji: '😈', result: 'demon_armor', resultQuantity: 1, materials: [{ itemId: 'demon_horn', quantity: 4 }, { itemId: 'void_essence', quantity: 3 }, { itemId: 'celestial_iron', quantity: 3 }, { itemId: 'shadow_silk', quantity: 2 }], goldCost: 2200, category: 'armor' },
  { id: 'craft_phoenix_mantle', name: 'Áo Choàng Phượng Hoàng', emoji: '🔥', result: 'phoenix_mantle', resultQuantity: 1, materials: [{ itemId: 'phoenix_feather', quantity: 4 }, { itemId: 'arcane_crystal', quantity: 3 }, { itemId: 'cloth', quantity: 3 }], goldCost: 2100, category: 'armor' },

  // === LEGENDARY ARMOR ===
  { id: 'craft_aegis', name: 'Aegis', emoji: '🛡️', result: 'aegis', resultQuantity: 1, materials: [{ itemId: 'eternal_gem', quantity: 2 }, { itemId: 'celestial_iron', quantity: 4 }, { itemId: 'dragon_scale_mat', quantity: 3 }, { itemId: 'crystalized_light', quantity: 2 }], goldCost: 8000, category: 'armor' },
  { id: 'craft_void_shroud', name: 'Mantle Hư Không', emoji: '🌀', result: 'void_shroud', resultQuantity: 1, materials: [{ itemId: 'abyssal_core', quantity: 2 }, { itemId: 'void_essence', quantity: 4 }, { itemId: 'shadow_silk', quantity: 4 }, { itemId: 'soul_shard', quantity: 3 }], goldCost: 8500, category: 'armor' },

  // === UNCOMMON ACCESSORIES ===
  { id: 'craft_ring_of_power', name: 'Nhẫn Sức Mạnh', emoji: '💍', result: 'power_amulet', resultQuantity: 1, materials: [{ itemId: 'gold_ore', quantity: 5 }, { itemId: 'soul_shard', quantity: 1 }], goldCost: 200, category: 'accessory' },
  { id: 'craft_amulet_of_life', name: 'Dây Chuyền Sự Sống', emoji: '📿', result: 'life_pendant', resultQuantity: 1, materials: [{ itemId: 'rare_herb', quantity: 4 }, { itemId: 'soul_shard', quantity: 1 }], goldCost: 180, category: 'accessory' },
  { id: 'craft_speed_ring', name: 'Nhẫn Tốc Độ', emoji: '💍', result: 'speed_ring', resultQuantity: 1, materials: [{ itemId: 'gold_ore', quantity: 3 }, { itemId: 'hardwood', quantity: 3 }], goldCost: 170, category: 'accessory' },

  // === RARE ACCESSORIES ===
  { id: 'craft_mithril_ring', name: 'Nhẫn Mithril', emoji: '💍', result: 'mithril_ring', resultQuantity: 1, materials: [{ itemId: 'mithril_ingot', quantity: 2 }, { itemId: 'gold_ore', quantity: 3 }, { itemId: 'starstone', quantity: 1 }], goldCost: 600, category: 'accessory' },
  { id: 'craft_arcane_amulet', name: 'Dây Chuyền Huyền Bí', emoji: '📿', result: 'arcane_amulet', resultQuantity: 1, materials: [{ itemId: 'arcane_crystal', quantity: 3 }, { itemId: 'gold_ore', quantity: 2 }, { itemId: 'soul_shard', quantity: 2 }], goldCost: 650, category: 'accessory' },
  { id: 'craft_shadow_cloak_acc', name: 'Bùa Bóng Tối', emoji: '🕸️', result: 'shadow_amulet', resultQuantity: 1, materials: [{ itemId: 'shadow_silk', quantity: 2 }, { itemId: 'soul_shard', quantity: 3 }, { itemId: 'gold_ore', quantity: 2 }], goldCost: 580, category: 'accessory' },

  // === EPIC ACCESSORIES ===
  { id: 'craft_dragon_pendant', name: 'Dây Chuyền Rồng', emoji: '🐲', result: 'dragon_pendant', resultQuantity: 1, materials: [{ itemId: 'dragon_scale_mat', quantity: 3 }, { itemId: 'phoenix_feather', quantity: 1 }, { itemId: 'mithril_ingot', quantity: 2 }, { itemId: 'gold_ore', quantity: 3 }], goldCost: 1800, category: 'accessory' },
  { id: 'craft_demon_ring', name: 'Nhẫn Daemon', emoji: '😈', result: 'demon_ring', resultQuantity: 1, materials: [{ itemId: 'demon_horn', quantity: 3 }, { itemId: 'void_essence', quantity: 2 }, { itemId: 'gold_ore', quantity: 3 }], goldCost: 1900, category: 'accessory' },
  { id: 'craft_phoenix_amulet', name: 'Dây Chuyền Phượng Hoàng', emoji: '🔥', result: 'phoenix_amulet', resultQuantity: 1, materials: [{ itemId: 'phoenix_feather', quantity: 3 }, { itemId: 'celestial_iron', quantity: 2 }, { itemId: 'gold_ore', quantity: 2 }], goldCost: 2000, category: 'accessory' },

  // === LEGENDARY ACCESSORIES ===
  { id: 'craft_eternal_ring', name: 'Nhẫn Vĩnh Cửu', emoji: '🌟', result: 'eternal_ring', resultQuantity: 1, materials: [{ itemId: 'eternal_gem', quantity: 2 }, { itemId: 'crystalized_light', quantity: 2 }, { itemId: 'mithril_ingot', quantity: 3 }, { itemId: 'gold_ore', quantity: 5 }], goldCost: 6000, category: 'accessory' },
  { id: 'craft_abyssal_pendant', name: 'Dây Chuyền Địa Ngục', emoji: '💀', result: 'abyssal_pendant', resultQuantity: 1, materials: [{ itemId: 'abyssal_core', quantity: 2 }, { itemId: 'demon_horn', quantity: 3 }, { itemId: 'void_essence', quantity: 2 }, { itemId: 'gold_ore', quantity: 4 }], goldCost: 6500, category: 'accessory' },

  // === POTIONS ===
  { id: 'craft_mega_health', name: 'Bình Máu Lớn', emoji: '🧪', result: 'mega_health', resultQuantity: 3, materials: [{ itemId: 'herb', quantity: 5 }, { itemId: 'rare_herb', quantity: 2 }], goldCost: 80, category: 'potion' },
  { id: 'craft_mana_potion', name: 'Bình Mana', emoji: '💧', result: 'mana_potion', resultQuantity: 3, materials: [{ itemId: 'herb', quantity: 4 }, { itemId: 'magic_dust', quantity: 2 }], goldCost: 70, category: 'potion' },
  { id: 'craft_elixir', name: 'Elixir', emoji: '🧪', result: 'elixir', resultQuantity: 2, materials: [{ itemId: 'rare_herb', quantity: 4 }, { itemId: 'magic_dust', quantity: 3 }, { itemId: 'soul_shard', quantity: 1 }], goldCost: 200, category: 'potion' },
];

export function findRecipe(id: string): CraftingRecipe | undefined {
  return RECIPES.find(r => r.id === id);
}

function getMaterialName(id: string): string {
  if (ITEMS[id]) return `${ITEMS[id].emoji} ${ITEMS[id].name}`;
  if (MATERIALS[id]) return `${MATERIALS[id].emoji} ${MATERIALS[id].name}`;
  return id;
}

export function canCraft(player: Player, recipe: CraftingRecipe): { ok: boolean; missing: string } {
  if (player.stats.gold < recipe.goldCost) {
    return { ok: false, missing: `Không đủ Gold (cần ${recipe.goldCost})` };
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
    message: `Đã chế tạo **${recipe.name}** x${recipe.resultQuantity} thành công! (-${recipe.goldCost} Gold)`,
    item: resultItem
  };
}

export function getRecipesByCategory(category: CraftingRecipe['category']): CraftingRecipe[] {
  return RECIPES.filter(r => r.category === category);
}

export function getRecipesByRarity(rarity: string): CraftingRecipe[] {
  return RECIPES.filter(r => {
    const item = ITEMS[r.result];
    return item && item.rarity === rarity;
  });
}
