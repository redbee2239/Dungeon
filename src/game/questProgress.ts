import { getQuestById } from './quests';
import { Player } from './database';
import { Database } from './database';

export async function updateQuestProgress(
  db: Database,
  player: Player,
  type: 'kill' | 'floor' | 'gold' | 'potion' | 'boss' | 'earn_gold',
  amount: number
): Promise<void> {
  if (!player.quests) return;

  let updated = false;

  for (const q of player.quests.daily) {
    const quest = getQuestById(q.questId);
    if (!quest || q.claimed || q.progress >= quest.target) continue;

    if (type === 'kill' && (quest.id.includes('kill'))) {
      q.progress += amount;
      updated = true;
    } else if (type === 'floor' && quest.id.includes('floor')) {
      q.progress += amount;
      updated = true;
    } else if (type === 'potion' && quest.id.includes('potion')) {
      q.progress += amount;
      updated = true;
    } else if (type === 'boss' && quest.id.includes('boss')) {
      q.progress += amount;
      updated = true;
    }
  }

  for (const q of player.quests.weekly) {
    const quest = getQuestById(q.questId);
    if (!quest || q.claimed || q.progress >= quest.target) continue;

    if (type === 'kill' && quest.id.includes('kill')) {
      q.progress += amount;
      updated = true;
    } else if (type === 'floor' && quest.id.includes('floor')) {
      q.progress += amount;
      updated = true;
    } else if (type === 'boss' && quest.id.includes('boss')) {
      q.progress += amount;
      updated = true;
    }
  }

  if (updated) {
    await db.updatePlayer(player);
  }
}
