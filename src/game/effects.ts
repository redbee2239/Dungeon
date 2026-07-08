export type EquipmentEffect =
  | 'poison'           // Gây độc X lượt
  | 'burn'             // Gây cháy X lượt
  | 'stun'             // Choáng X% chance
  | 'double_attack'    // Đánh 2 lần
  | 'lifesteal'        // Hút máu X%
  | 'crit_boost'       // Tăng chí mạng X%
  | 'thorns'           // Phản伤 X%
  | 'mana_steal'       // Hút mana
  | 'dodge_boost'      // Tăng né X%
  | 'execute'          // Giết kẻ dưới X% HP
  | 'bleed'            // Gây chảy máu X lượt
  | 'frost'            // Làm chậm X% speed
  | 'chain_lightning'  // Đánh lan X kẻ
  | 'revive'           // Hồi sinh 1 lần
  | 'shield_break';    // Giảm giáp X%

export interface EquipmentEffectDef {
  type: EquipmentEffect;
  chance: number;      // % chance triggered (0-100)
  value: number;       // power of effect (damage %, heal %, etc.)
  turns?: number;      // duration for DoT effects
}

export const EFFECT_INFO: Record<EquipmentEffect, { name: string; emoji: string; description: string }> = {
  poison: { name: 'Độc', emoji: '☠️', description: 'Gây độc kẻ thù' },
  burn: { name: 'Cháy', emoji: '🔥', description: 'Gây cháy kẻ thù' },
  stun: { name: 'Choáng', emoji: '💫', description: 'Choáng kẻ thù' },
  double_attack: { name: 'Đánh Đôi', emoji: '⚔️', description: 'Đánh 2 lần liên tiếp' },
  lifesteal: { name: 'Hút Máu', emoji: '🧛', description: 'Hút máu từ sát thương' },
  crit_boost: { name: 'Sát Thủ', emoji: '🎯', description: 'Tăng chí mạng' },
  thorns: { name: 'Gai', emoji: '🌵', description: 'Phản傷 khi bị đánh' },
  mana_steal: { name: 'Hút Mana', emoji: '💧', description: 'Hút mana từ kẻ thù' },
  dodge_boost: { name: 'Linh Hoạt', emoji: '💨', description: 'Tăng né tránh' },
  execute: { name: 'Kết Liễu', emoji: '💀', description: 'Giết kẻ yếu' },
  bleed: { name: 'Chảy Máu', emoji: '🩸', description: 'Gây chảy máu' },
  frost: { name: 'Đóng Băng', emoji: '❄️', description: 'Làm chậm kẻ thù' },
  chain_lightning: { name: 'Sét Đánh Lan', emoji: '⚡', description: 'Đánh lan kẻ thù' },
  revive: { name: 'Hồi Sinh', emoji: '✨', description: 'Hồi sinh khi chết' },
  shield_break: { name: 'Phá Giáp', emoji: '🛡️', description: 'Giảm giáp kẻ thù' },
};

export interface EquipmentEffectRoll {
  triggered: boolean;
  effect: EquipmentEffect;
  value: number;
  message: string;
}

export function rollEquipmentEffect(effects: EquipmentEffectDef[]): EquipmentEffectRoll[] {
  const results: EquipmentEffectRoll[] = [];

  for (const eff of effects) {
    const roll = Math.random() * 100;
    if (roll <= eff.chance) {
      let msg = '';
      const info = EFFECT_INFO[eff.type];

      switch (eff.type) {
        case 'poison':
          msg = `${info.emoji} Độc tố gây **${eff.value}% HP** trong ${eff.turns || 3} lượt!`;
          break;
        case 'burn':
          msg = `${info.emoji} Lửa thiêu造成 **${eff.value}% HP** trong ${eff.turns || 3} lượt!`;
          break;
        case 'stun':
          msg = `${info.emoji} Kẻ thù bị choáng **${eff.turns || 1}** lượt!`;
          break;
        case 'double_attack':
          msg = `${info.emoji} Đánh đôi! **${eff.value}%** sát thương lần 2!`;
          break;
        case 'lifesteal':
          msg = `${info.emoji} Hút **${eff.value}%** máu từ sát thương!`;
          break;
        case 'crit_boost':
          msg = `${info.emoji} Chí mạng +**${eff.value}%**!`;
          break;
        case 'thorns':
          msg = `${info.emoji} Phản傷 **${eff.value}%** sát thương!`;
          break;
        case 'mana_steal':
          msg = `${info.emoji} Hút **${eff.value}** mana!`;
          break;
        case 'dodge_boost':
          msg = `${info.emoji} Né tránh +**${eff.value}%**!`;
          break;
        case 'execute':
          msg = `${info.emoji} Kết liễu kẻ dưới **${eff.value}%** HP!`;
          break;
        case 'bleed':
          msg = `${info.emoji} Chảy máu gây **${eff.value}% HP** trong ${eff.turns || 3} lượt!`;
          break;
        case 'frost':
          msg = `${info.emoji} Kẻ thù bị đóng băng, -**${eff.value}%** speed!`;
          break;
        case 'chain_lightning':
          msg = `${info.emoji} Sét đánh lan **${eff.value}** kẻ thù!`;
          break;
        case 'revive':
          msg = `${info.emoji} Hồi sinh với **${eff.value}%** HP!`;
          break;
        case 'shield_break':
          msg = `${info.emoji} Phá giáp, -**${eff.value}%** DEF trong 3 lượt!`;
          break;
      }

      results.push({ triggered: true, effect: eff.type, value: eff.value, message: msg });
    }
  }

  return results;
}
