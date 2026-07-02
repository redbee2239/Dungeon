import { Player, Database } from './database';
import { addItem } from './inventory';
import { ITEMS } from './items';

export const SUMMER_EVENT = {
  name: '🎉 Mùa Hè Bùng Nổ',
  startDate: '2026-07-01',
  durationDays: 15,
  description: 'Đăng nhập mỗi ngày để nhận quà!',
};

export const DAILY_LOGIN_REWARDS: { day: number; gold: number; gems: number; summerCoins: number; items?: { id: string; qty: number }[] }[] = [
  { day: 1,  gold: 200,   gems: 20,   summerCoins: 10 },
  { day: 2,  gold: 300,   gems: 30,   summerCoins: 15, items: [{ id: 'health_potion', qty: 2 }] },
  { day: 3,  gold: 400,   gems: 40,   summerCoins: 20 },
  { day: 4,  gold: 500,   gems: 50,   summerCoins: 25, items: [{ id: 'mana_potion', qty: 2 }] },
  { day: 5,  gold: 600,   gems: 60,   summerCoins: 30, items: [{ id: 'health_potion', qty: 3 }] },
  { day: 6,  gold: 800,   gems: 80,   summerCoins: 35 },
  { day: 7,  gold: 1000,  gems: 100,  summerCoins: 50, items: [{ id: 'mega_health', qty: 2 }, { id: 'mana_potion', qty: 3 }] },
  { day: 8,  gold: 500,   gems: 100,  summerCoins: 40 },
  { day: 9,  gold: 600,   gems: 120,  summerCoins: 45, items: [{ id: 'health_potion', qty: 5 }] },
  { day: 10, gold: 800,   gems: 150,  summerCoins: 55, items: [{ id: 'mana_mega', qty: 2 }] },
  { day: 11, gold: 1000,  gems: 180,  summerCoins: 60, items: [{ id: 'mega_health', qty: 3 }] },
  { day: 12, gold: 1200,  gems: 200,  summerCoins: 70 },
  { day: 13, gold: 1500,  gems: 250,  summerCoins: 80, items: [{ id: 'elixir', qty: 1 }] },
  { day: 14, gold: 2000,  gems: 300,  summerCoins: 90, items: [{ id: 'elixir', qty: 2 }] },
  { day: 15, gold: 3000,  gems: 500,  summerCoins: 100, items: [{ id: 'elixir', qty: 3 }, { id: 'mega_health', qty: 5 }] },
];

export function getEventStartDate(): Date {
  return new Date(SUMMER_EVENT.startDate);
}

export function isEventActive(): boolean {
  const start = getEventStartDate();
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const daysElapsed = Math.floor(diff / (1000 * 60 * 60 * 24));
  return daysElapsed >= 0 && daysElapsed < SUMMER_EVENT.durationDays;
}

export function getDaysRemaining(): number {
  const start = getEventStartDate();
  const now = new Date();
  const diff = start.getTime() + SUMMER_EVENT.durationDays * 24 * 60 * 60 * 1000 - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getEventDay(): number {
  const start = getEventStartDate();
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

export async function claimDailyLogin(db: Database, player: Player): Promise<{ success: boolean; message: string; day?: number }> {
  if (!isEventActive()) {
    return { success: false, message: '❌ Sự kiện Mùa Hè đã kết thúc!' };
  }

  const eventDay = getEventDay();
  if (eventDay > 15) {
    return { success: false, message: '❌ Sự kiện Mùa Hè đã kết thúc!' };
  }

  const lastLogin = player.summerEvent?.lastDailyLogin || 0;
  const lastLoginDate = new Date(lastLogin);

  if (isSameDay(lastLoginDate, new Date())) {
    return { success: false, message: '❌ Bạn đã đăng nhập hôm nay rồi! Quay lại vào ngày mai.' };
  }

  const consecutiveDays = player.summerEvent?.consecutiveDays || 0;
  let todayDay = consecutiveDays + 1;

  if (todayDay > 15) {
    todayDay = 15;
  }

  const reward = DAILY_LOGIN_REWARDS[todayDay - 1];
  if (!reward) {
    return { success: false, message: '❌ Không tìm thấy phần thưởng!' };
  }

  await db.addGold(player, reward.gold);
  await db.addGems(player, reward.gems);
  player.summerCoins = (player.summerCoins || 0) + reward.summerCoins;

  let itemMsg = '';
  if (reward.items) {
    for (const item of reward.items) {
      const itemData = ITEMS[item.id];
      if (itemData) {
        addItem(player.inventory, itemData, item.qty);
        itemMsg += `\n🧪 +${item.qty}x ${itemData.name}`;
      }
    }
  }

  if (!player.summerEvent) {
    player.summerEvent = {
      consecutiveDays: 0,
      lastDailyLogin: 0,
      claimedCode: false,
      minigameLastPlay: 0,
      minigameWins: 0,
    };
  }

  player.summerEvent.consecutiveDays = todayDay;
  player.summerEvent.lastDailyLogin = Date.now();
  await db.updatePlayer(player);

  const daysLeft = getDaysRemaining();

  return {
    success: true,
    message:
      `🎉 **Đăng Nhập Ngày ${todayDay}/15**\n\n` +
      `💰 +${reward.gold} Gold\n` +
      `💎 +${reward.gems} Gem\n` +
      `🪙 +${reward.summerCoins} Summer Coin` +
      itemMsg +
      `\n\n📅 Còn **${daysLeft}** ngày nữa sự kiện kết thúc!`,
    day: todayDay,
  };
}

// Mini game: Đánh cược Gold
export interface MiniGameResult {
  success: boolean;
  message: string;
  goldWon?: number;
}

export function playCoinFlip(bet: number): MiniGameResult {
  const won = Math.random() < 0.5;
  if (won) {
    return {
      success: true,
      message: `🪙 **Trúng!** +${bet} Gold`,
      goldWon: bet,
    };
  } else {
    return {
      success: false,
      message: `🪙 **Mất!** -${bet} Gold`,
      goldWon: -bet,
    };
  }
}

export function playDiceGuess(guess: number, bet: number): MiniGameResult {
  const rolled = Math.floor(Math.random() * 6) + 1;
  if (guess === rolled) {
    const winAmount = bet * 5;
    return {
      success: true,
      message: `🎲 Rolled **${rolled}** - Đoán đúng! +${winAmount} Gold`,
      goldWon: winAmount,
    };
  } else {
    return {
      success: false,
      message: `🎲 Rolled **${rolled}** - Đoán sai! -${bet} Gold`,
      goldWon: -bet,
    };
  }
}

export function playRPS(playerChoice: 'rock' | 'paper' | 'scissors', bet: number): MiniGameResult {
  const choices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
  const botChoice = choices[Math.floor(Math.random() * 3)];

  const win = (playerChoice === 'rock' && botChoice === 'scissors') ||
    (playerChoice === 'paper' && botChoice === 'rock') ||
    (playerChoice === 'scissors' && botChoice === 'paper');
  const draw = playerChoice === botChoice;

  const emoji: Record<string, string> = { rock: '🪨', paper: '📄', scissors: '✂️' };

  if (draw) {
    return {
      success: true,
      message: `🤝 ${emoji[playerChoice]} vs ${emoji[botChoice]} - Hòa! +0 Gold`,
      goldWon: 0,
    };
  }
  if (win) {
    const winAmount = bet * 2;
    return {
      success: true,
      message: `✅ ${emoji[playerChoice]} vs ${emoji[botChoice]} - Thắng! +${winAmount} Gold`,
      goldWon: winAmount,
    };
  }
  return {
    success: false,
    message: `❌ ${emoji[playerChoice]} vs ${emoji[botChoice]} - Thua! -${bet} Gold`,
    goldWon: -bet,
  };
}
