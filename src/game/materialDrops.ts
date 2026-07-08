import { Item } from './items';
import { MATERIALS } from './materials';

interface DropEntry {
  materialId: string;
  weight: number;
}

const DROP_TABLE: { minLevel: number; maxLevel: number; drops: DropEntry[] }[] = [
  {
    minLevel: 1, maxLevel: 5,
    drops: [
      { materialId: 'wood', weight: 30 },
      { materialId: 'herb', weight: 30 },
      { materialId: 'iron_ore', weight: 40 }
    ]
  },
  {
    minLevel: 6, maxLevel: 10,
    drops: [
      { materialId: 'hardwood', weight: 25 },
      { materialId: 'rare_herb', weight: 25 },
      { materialId: 'gold_ore', weight: 30 },
      { materialId: 'iron_ore', weight: 20 }
    ]
  },
  {
    minLevel: 11, maxLevel: 15,
    drops: [
      { materialId: 'magic_dust', weight: 40 },
      { materialId: 'mithril_ore', weight: 35 },
      { materialId: 'gold_ore', weight: 25 }
    ]
  },
  {
    minLevel: 16, maxLevel: 999,
    drops: [
      { materialId: 'soul_shard', weight: 25 },
      { materialId: 'dragon_scale_mat', weight: 20 },
      { materialId: 'demon_horn', weight: 20 },
      { materialId: 'mithril_ore', weight: 20 },
      { materialId: 'magic_dust', weight: 15 }
    ]
  }
];

function pickDrop(drops: DropEntry[]): string {
  const totalWeight = drops.reduce((sum, d) => sum + d.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const drop of drops) {
    roll -= drop.weight;
    if (roll <= 0) return drop.materialId;
  }
  return drops[drops.length - 1].materialId;
}

export function getMaterialDrop(monsterLevel: number): { materialId: string; quantity: number }[] {
  const table = DROP_TABLE.find(t => monsterLevel >= t.minLevel && monsterLevel <= t.maxLevel);
  if (!table) return [];

  const numDrops = Math.random() < 0.3 ? 2 : 1;
  const results: { materialId: string; quantity: number }[] = [];
  const picked = new Set<string>();

  for (let i = 0; i < numDrops; i++) {
    let id = pickDrop(table.drops);
    if (picked.has(id) && table.drops.length > 1) {
      id = pickDrop(table.drops);
    }
    picked.add(id);
    const qty = monsterLevel >= 16 && Math.random() < 0.2 ? 2 : 1;
    results.push({ materialId: id, quantity: qty });
  }

  return results;
}
