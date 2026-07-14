import { EmbedBuilder } from 'discord.js';

const CLASS_LIST = [
  '⚔️ **Chiến Binh** - Tank, HP cao',
  '🔮 **Pháp Sư** - Sát thương phép',
  '🗡️ **Sát Thủ** - Tốc độ, chí mạng',
  '✝️ **Tu Sĩ** - Hỗ trợ, hồi phục',
  '🏟️ **Đấu Sĩ** - ATK cực cao',
  '🏹 **Cung Thủ** - Tấn công xa',
  '💀 **Âm Linh Sư** - Triệu hồi undead'
];

export const prefixCommand = {
  name: 'help',
  description: 'Xem danh sách lệnh',
  execute: async (message: any, args: string[]) => {
    const page = parseInt(args[0]) || 1;

    const pages: EmbedBuilder[] = [];

    pages.push(
      new EmbedBuilder()
        .setTitle('📖 Hướng Dẫn - Trang 1/4')
        .setDescription('Tiền tố: **`,`** | Prefix commands')
        .addFields(
          {
            name: '🎮 Tạo Nhân Vật',
            value: [
              '`create <class>` - Tạo nhân vật mới',
              '`changeclass` / `cc` - Đổi class (reset level, giữ inventory)'
            ].join('\n'),
            inline: true
          },
          {
            name: '👤 Thông Tin',
            value: [
              '`profile` - Xem thông tin nhân vật',
              '`inventory` / `inv` - Xem hành trang',
              '`balance` / `bal` - Xem gold/gem'
            ].join('\n'),
            inline: true
          },
          {
            name: '📊 Chỉ Số',
            value: [
              '`stat` - Xem/nâng chỉ số',
              '`stat atk 3` - ATK +6',
              '`stat spd` - Nâng speed',
              '`stat reset` - Reset chỉ số (200 💎)'
            ].join('\n'),
            inline: true
          },
          {
            name: '🎯 Kỹ Năng',
            value: [
              '`skills` - Xem danh sách kỹ năng',
              '`learn <id>` - Học kỹ năng'
            ].join('\n'),
            inline: true
          },
          {
            name: '⚔️ Trang Bị',
            value: [
              '`equip <id>` - Trang bị',
              '`equip list` - Xem trang bị đang đeo',
              '`unequip <slot>` - Tháo trang bị'
            ].join('\n'),
            inline: true
          },
          {
            name: '📦 Rương',
            value: [
              '`chest list` - Xem rương',
              '`chest open <id>` - Mở rương'
            ].join('\n'),
            inline: true
          }
        )
        .setColor(0x3498DB)
    );

    pages.push(
      new EmbedBuilder()
        .setTitle('📖 Hướng Dẫn - Trang 2/4')
        .setDescription('Chiến đấu & Thương mại')
        .addFields(
          {
            name: '🏰 Dungeon',
            value: [
              '`dungeon` - Vào dungeon đánh quái',
              '`dungeon <số>` - Chọn tầng cụ thể',
              '`heal` - Hồi phục HP/MP'
            ].join('\n'),
            inline: true
          },
          {
            name: '⚔️ PVP',
            value: [
              '`pvp @user` - Thách đấu',
              '20s/turn, hết giờ = thua',
              'Lv chênh >10 = không EXP'
            ].join('\n'),
            inline: true
          },
          {
            name: '🛒 Cửa Hàng',
            value: [
              '`shop buy` - Mua đồ (chọn loại)',
              '`shop sell` - Bán đồ',
              '`shop buy <id>` - Mua nhanh theo ID'
            ].join('\n'),
            inline: true
          },
          {
            name: '🧪 Thuốc',
            value: [
              '**Hồi phục:** Bình Máu, Bình Mana, Elixir',
              '**Buff:** Thuốc Lực(ATK), Thuốc Giáp(DEF), Thuốc Nhanh(SPD)',
              '**Buff mạnh:** Thuốc Điên(ATK+50/DEF-10)',
              '',
              '**Giới hạn:** Tối đa 2 thuốc/combat'
            ].join('\n'),
            inline: false
          },
          {
            name: '💰 Bán Tự Động',
            value: [
              '`autosell common` - Bán Phổ Thông',
              '`autosell uncommon` - Bán Thông Thường',
              '`autosell rare` - Bán Hiếm',
              '`autosell epic` - Bán Sử Thi',
              '`autosell legendary` - Bán Huyền Thoại'
            ].join('\n'),
            inline: true
          }
        )
        .setColor(0xE67E22)
    );

    pages.push(
      new EmbedBuilder()
        .setTitle('📖 Hướng Dẫn - Trang 3/4')
        .setDescription('Gacha & Thú Cưng')
        .addFields(
          {
            name: '🎰 Gacha Trang Bị',
            value: [
              '`gacha 1` - Quay 1 lần (50 💎)',
              '`gacha 10` - Quay 10 lần (450 💎)',
              '`gacha history` - Xem lịch sử quay'
            ].join('\n'),
            inline: true
          },
          {
            name: '🐾 Gacha Pet',
            value: [
              '`pet` - Quay pet (100 💎)',
              '`pet list` - Xem danh sách pet',
              '`pet equip` - Mang pet',
              '`pet info` - Xem pet đang mang'
            ].join('\n'),
            inline: true
          },
          {
            name: '📊 Tỷ Lệ Gacha',
            value: [
              '⚪ Phổ Thông: 40%',
              '🟢 Thông Thường: 30%',
              '🔵 Hiếm: 20%',
              '🟣 Sử Thi: 8% (pity: 50)',
              '🟠 Huyền Thoại: 2% (pity: 150)'
            ].join('\n'),
            inline: true
          },
          {
            name: '📋 Nhiệm Vụ',
            value: [
              '`quest` - Xem nhiệm vụ hàng ngày',
              '`quest claim` - Nhận thưởng'
            ].join('\n'),
            inline: true
          }
        )
        .setColor(0x9B59B6)
    );

    pages.push(
      new EmbedBuilder()
        .setTitle('📖 Hướng Dẫn - Trang 4/4')
        .setDescription('Hệ thống & Class')
        .addFields(
          {
            name: '🏆 Xếp Hạng',
            value: [
              '`leaderboard` / `lb` - Bảng xếp hạng',
              '`top` - Top người chơi'
            ].join('\n'),
            inline: true
          },
          {
            name: '🎁 Code & Gift',
            value: [
              '`code <mã>` - Nhập code nhận thưởng',
              '`gift <@user> <gold/gem> <số lượng>` - Tặng quà'
            ].join('\n'),
            inline: true
          },
          {
            name: '🎮 Danh Sách Class',
            value: CLASS_LIST.join('\n'),
            inline: false
          },
          {
            name: '⚙️ Hệ Thống',
            value: [
              '**Dungeon:** Tầng 1-100, boss mỗi 5 tầng',
              '**Quái:** Tăng mạnh theo tầng',
              '**Speed:** Tối đa 130, ảnh hưởng lượt đánh',
              '**Thuốc:** Tối đa 2 thuốc/combat',
              '**Kỹ năng:** Tối đa 3 lượt/skill (Summoner: 1)'
            ].join('\n'),
            inline: false
          }
        )
        .setColor(0x2ECC71)
    );

    const embed = pages[Math.min(page - 1, pages.length - 1)];

    message.reply({
      embeds: [embed],
      content: `📄 Trang **${Math.min(page, pages.length)}/${pages.length}** - Dùng \`,help <số trang>\` để xem trang khác`
    });
  }
};
