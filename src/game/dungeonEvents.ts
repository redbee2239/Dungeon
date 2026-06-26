export type EventEffect = 
  | 'monster_berserk'    // Quái +100% sát thương
  | 'no_dodge'           // Nhân vật không thể né
  | 'stun'               // Nhân vật bị choáng 2 lượt
  | 'monster_heal'       // Quái hồi máu mỗi lượt
  | 'player_weakness'    // Nhân vật -50% sát thương
  | 'monster_shield'     // Quái +50% phòng thủ
  | 'poison'             // Nhân vật bị nhiễm độc (mất máu mỗi lượt)
  | 'monster_lifesteal'  // Quái hút máu
  | 'player_slow'        // Nhân vật -30% tốc độ
  | 'critical_up';       // Quái tăng chí mạng

export interface DungeonEvent {
  effect: EventEffect;
  stacks: number;
  turnsLeft: number;
}

export interface ActiveEvents {
  events: DungeonEvent[];
}

export const EVENT_LIST: { effect: EventEffect; name: string; emoji: string; description: string }[] = [
  { effect: 'monster_berserk', name: 'Quái Điên Cuồng', emoji: '🔥', description: 'Quái +100% sát thương' },
  { effect: 'no_dodge', name: 'Trói Buộc', emoji: '⛓️', description: 'Nhân vật không thể né' },
  { effect: 'stun', name: 'Choáng', emoji: '💫', description: 'Nhân vật bị choáng 2 lượt' },
  { effect: 'monster_heal', name: 'Hồi Sinh', emoji: '💚', description: 'Quái hồi 10% HP mỗi lượt' },
  { effect: 'player_weakness', name: 'Yếu Đuối', emoji: '😵', description: 'Nhân vật -50% sát thương' },
  { effect: 'monster_shield', name: 'Khiên Hắc Ám', emoji: '🛡️', description: 'Quái +50% phòng thủ' },
  { effect: 'poison', name: 'Độc', emoji: '☠️', description: 'Nhân vật mất 5% HP mỗi lượt' },
  { effect: 'monster_lifesteal', name: 'Hút Máu', emoji: '🧛', description: 'Quái hút 20% sát thương gây ra' },
  { effect: 'player_slow', name: 'Chậm Chạp', emoji: '🐌', description: 'Nhân vật -30% tốc độ' },
  { effect: 'critical_up', name: 'Mắt Sát Thủ', emoji: '👁️', description: 'Quái tăng chí mạng' },
];

export function createActiveEvents(): ActiveEvents {
  return { events: [] };
}

export function rollForEvent(floor: number, currentEvents: ActiveEvents): DungeonEvent | null {
  if (floor < 20) return null;
  if (currentEvents.events.length >= 3) return null;

  const baseChance = Math.min(0.6, (floor - 20) * 0.02);
  if (Math.random() > baseChance) return null;

  const event = EVENT_LIST[Math.floor(Math.random() * EVENT_LIST.length)];

  const existing = currentEvents.events.find(e => e.effect === event.effect);
  if (existing) {
    if (existing.stacks < 3) {
      existing.stacks++;
      existing.turnsLeft = Math.max(existing.turnsLeft, 3);
    }
    return existing;
  }

  const newEvent: DungeonEvent = {
    effect: event.effect,
    stacks: 1,
    turnsLeft: 3
  };
  currentEvents.events.push(newEvent);
  return newEvent;
}

export function tickEvents(events: ActiveEvents): void {
  for (const event of events.events) {
    event.turnsLeft--;
  }
  events.events = events.events.filter(e => e.turnsLeft > 0);
}

export function hasEffect(events: ActiveEvents, effect: EventEffect): boolean {
  return events.events.some(e => e.effect === effect);
}

export function getEffectStacks(events: ActiveEvents, effect: EventEffect): number {
  const event = events.events.find(e => e.effect === effect);
  return event ? event.stacks : 0;
}

export function getEventMessages(events: ActiveEvents): string[] {
  const messages: string[] = [];
  for (const event of events.events) {
    const info = EVENT_LIST.find(e => e.effect === event.effect);
    if (info) {
      messages.push(`${info.emoji} ${info.name} (x${event.stacks}) - ${event.turnsLeft} lượt`);
    }
  }
  return messages;
}

export function getMonsterDamageMultiplier(events: ActiveEvents): number {
  let mult = 1.5;
  if (hasEffect(events, 'monster_berserk')) {
    mult += 1.0 * getEffectStacks(events, 'monster_berserk');
  }
  return mult;
}

export function getPlayerDamageMultiplier(events: ActiveEvents): number {
  let mult = 1;
  if (hasEffect(events, 'player_weakness')) {
    mult -= 0.5 * getEffectStacks(events, 'player_weakness');
  }
  return Math.max(0.1, mult);
}

export function getMonsterDefenseMultiplier(events: ActiveEvents): number {
  let mult = 1;
  if (hasEffect(events, 'monster_shield')) {
    mult += 0.5 * getEffectStacks(events, 'monster_shield');
  }
  return mult;
}

export function getPlayerSpeedMultiplier(events: ActiveEvents): number {
  let mult = 1;
  if (hasEffect(events, 'player_slow')) {
    mult -= 0.3 * getEffectStacks(events, 'player_slow');
  }
  return Math.max(0.1, mult);
}

export function getMonsterCritBonus(events: ActiveEvents): number {
  let bonus = 0;
  if (hasEffect(events, 'critical_up')) {
    bonus += 0.1 * getEffectStacks(events, 'critical_up');
  }
  return bonus;
}

export function getHealAmount(monsterMaxHP: number): number {
  return Math.floor(monsterMaxHP * 0.1);
}

export function getPoisonDamage(playerMaxHP: number): number {
  return Math.floor(playerMaxHP * 0.05);
}

export function getLifestealAmount(damage: number): number {
  return Math.floor(damage * 0.2);
}
