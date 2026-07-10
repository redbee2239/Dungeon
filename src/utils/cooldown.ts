const cooldowns = new Map<string, number>();

export function setCooldown(userId: string, command: string, seconds: number): void {
  const key = `${userId}:${command}`;
  cooldowns.set(key, Date.now() + seconds * 1000);
}

export function getCooldown(userId: string, command: string): number {
  const key = `${userId}:${command}`;
  const expiry = cooldowns.get(key);
  if (!expiry) return 0;
  
  const remaining = Math.ceil((expiry - Date.now()) / 1000);
  if (remaining <= 0) {
    cooldowns.delete(key);
    return 0;
  }
  
  return remaining;
}

export function hasCooldown(userId: string, command: string): boolean {
  return getCooldown(userId, command) > 0;
}

export function clearCooldown(userId: string): void {
  for (const key of cooldowns.keys()) {
    if (key.startsWith(`${userId}:`)) {
      cooldowns.delete(key);
    }
  }
}

export function formatCooldown(seconds: number): string {
  if (seconds <= 0) return '';
  if (seconds < 60) return `${seconds} giây`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins} phút ${secs} giây` : `${mins} phút`;
}
