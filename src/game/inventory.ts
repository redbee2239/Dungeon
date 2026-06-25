import { Item, ITEMS } from './items';

export interface Inventory {
  items: InventoryItem[];
  maxSlots: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export function createInventory(): Inventory {
  return {
    items: [],
    maxSlots: 20
  };
}

export function addItem(inventory: Inventory, item: Item, quantity: number = 1): { success: boolean; message: string } {
  const existing = inventory.items.find(i => i.itemId === item.id);
  
  if (existing) {
    existing.quantity += quantity;
    return { success: true, message: `Đã thêm ${quantity}x ${item.name}` };
  }

  if (inventory.items.length >= inventory.maxSlots) {
    return { success: false, message: 'Hành trang đã đầy!' };
  }

  inventory.items.push({ itemId: item.id, quantity });
  return { success: true, message: `Đã thêm ${quantity}x ${item.name} vào hành trang` };
}

export function removeItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
  const index = inventory.items.findIndex(i => i.itemId === itemId);
  if (index === -1) return false;

  const invItem = inventory.items[index];
  if (invItem.quantity < quantity) return false;

  invItem.quantity -= quantity;
  if (invItem.quantity <= 0) {
    inventory.items.splice(index, 1);
  }

  return true;
}

export function hasItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
  const invItem = inventory.items.find(i => i.itemId === itemId);
  return invItem ? invItem.quantity >= quantity : false;
}

export function getItemCount(inventory: Inventory, itemId: string): number {
  const invItem = inventory.items.find(i => i.itemId === itemId);
  return invItem ? invItem.quantity : 0;
}

export function getEquippedItems(inventory: Inventory, type: 'weapon' | 'armor' | 'accessory'): Item | null {
  for (const invItem of inventory.items) {
    const item = ITEMS[invItem.itemId];
    if (item && item.type === type && invItem.quantity > 0) {
      return item;
    }
  }
  return null;
}

export function calculateBonusStats(inventory: Inventory): {
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  speed: number;
} {
  let attack = 0;
  let defense = 0;
  let hp = 0;
  let mp = 0;
  let speed = 0;

  for (const invItem of inventory.items) {
    const item = ITEMS[invItem.itemId];
    if (item && item.stats) {
      attack += item.stats.attack || 0;
      defense += item.stats.defense || 0;
      hp += item.stats.hp || 0;
      mp += item.stats.mp || 0;
      speed += item.stats.speed || 0;
    }
  }

  return { attack, defense, hp, mp, speed };
}

export function sellItem(inventory: Inventory, itemId: string, quantity: number = 1): { success: boolean; gold: number; message: string } {
  const invItem = inventory.items.find(i => i.itemId === itemId);
  if (!invItem || invItem.quantity < quantity) {
    return { success: false, gold: 0, message: 'Không đủ vật phẩm!' };
  }

  const item = ITEMS[itemId];
  if (!item) {
    return { success: false, gold: 0, message: 'Lỗi vật phẩm!' };
  }

  const gold = item.sellPrice * quantity;
  removeItem(inventory, itemId, quantity);
  
  return { success: true, gold, message: `Bán ${quantity}x ${item.name} được ${gold} gold` };
}
