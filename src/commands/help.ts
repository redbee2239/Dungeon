import { EmbedBuilder } from 'discord.js';

export const prefixCommand = {
  name: 'help',
  description: 'Xem danh sách lệnh',
  execute: async (message: any, args: string[]) => {
    const page = parseInt(args[0]) || 1;

    const pages: EmbedBuilder[] = [];

    // Page 1: Cơ bản & Character
    pages.push(
      new EmbedBuilder()
        .setTitle('📖 Hướng Dẫn - Trang 1/3')
        .setDescription('Game Bot - Tiền tố: `,`')
        .addFields(
          { name: '🎮 Tạo Nhân Vật', value: [
            '`,create <class>` - Tạo nhân vật',
            '`,` ,changeclass` / `,cc` - Đổi class (reset level, giữ inventory)',
            '',
            '**Class:** warrior, mage, rogue, cleric, gladiator, summoner, archer'
          ].join('\n') },
          { name: '👤 Thông Tin', value: [
            '`,profile` - Xem thông tin nhân vật',
            '`,inventory` / `,inv` - Xem hành trang',
            '`,balance` / `,bal` - Xem số dư gold/gem',
            '`,chest` - Xem rương'
          ].join('\n') },
          { name: '📊 Chỉ Số', value: [
            '`,stat` - Xem/nâng chỉ số',
            '`,stat atk 3` - ATK +6, các stat khác +1',
            '`,` ,stat spd` - Nâng speed',
            '',
            '**Giới hạn:** SPD tối đa 130'
          ].join('\n') },
          { name: '🎯 Kỹ Năng', value: [
            '`,skills` - Xem danh sách kỹ năng',
            '`,learn <id>` - Học kỹ năng',
            '',
            '**Alias:** `,skill`, `,hoc`'
          ].join('\n') },
          { name: '⚔️ Trang Bị', value: [
            '`,equip <id>` - Trang bị',
            '`,equip list` - Xem trang bị đang đeo',
            '`,unequip <weapon/armor/accessory>` - Tháo trang bị',
            '',
            '**Alias:** `,ep`, `,uneq`'
          ].join('\n') }
        )
        .setColor(0x0099FF)
    );

    // Page 2: Combat & Shop
    pages.push(
      new EmbedBuilder()
        .setTitle('📖 Hướng Dẫn - Trang 2/3')
        .setDescription('Chiến đấu & Mua bán')
        .addFields(
          { name: '🏰 Dungeon', value: [
            '`,dungeon` - Vào dungeon đánh quái',
            '`,dungeon <số>` - Chọn tầng cụ thể',
            '`,heal` - Hồi phục HP/MP',
            '',
            '**Combat:** Tấn Công / Kỹ Năng / Thuốc / Chạy Trốn',
            '**Từ tầng 20:** Có sự kiện ngẫu nhiên (buff quái, debuff người)'
          ].join('\n') },
          { name: '🛒 Cửa Hàng', value: [
            '`,shop buy` - Mua đồ (chọn loại: Vũ Khí/Giáp/Phụ Kiện/Thuốc)',
            '`,shop sell` - Bán đồ',
            '`,shop buy <id>` - Mua nhanh theo ID',
            '',
            '**Alias:** `,mua`, `,ban`'
          ].join('\n') },
          { name: '🧪 Thuốc (dùng trong combat)', value: [
            '**Hồi phục:** Bình Máu, Bình Mana, Elixir, Nước Mắt Phượng Hoàng',
            '**Buff:** Thuốc Lực(ATK), Thuốc Giáp(DEF), Thuốc Nhanh(SPD)',
            '**Buff mạnh:** Thuốc Điên(ATK+50/DEF-10), Thuốc Da Sắt(DEF+30/SPD-5)',
            '',
            '**Giới hạn:** Tối đa 2 thuốc/combat'
          ].join('\n') },
          { name: '💰 Bán Tự Động', value: [
            '`,autosell common` - Bán tất cả Phổ Thông',
            '`,autosell uncommon` - Bán tất cả Thông Thường',
            '`,autosell rare` - Bán tất cả Hiếm',
            '`,autosell epic` - Bán tất cả Sử Thi',
            '`,autosell legendary` - Bán tất cả Huyền Thoại',
            '',
            '**Alias:** `,as`, `,banhang`'
          ].join('\n') }
        )
        .setColor(0xFF6600)
    );

    // Page 3: Gacha & Other
    pages.push(
      new EmbedBuilder()
        .setTitle('📖 Hướng Dẫn - Trang 3/3')
        .setDescription('Gacha & Khác')
        .addFields(
          { name: '🎰 Gacha', value: [
            '`,gacha 1` - Quay 1 lần (50 💎)',
            '`,gacha 10` - Quay 10 lần (450 💎)',
            '`,gacha history` - Xem lịch sử quay'
          ].join('\n') },
          { name: '🏆 Xếp Hạng', value: [
            '`,leaderboard` / `,lb` - Bảng xếp hạng',
            '`,top` - Top người chơi'
          ].join('\n') },
          { name: '🎁 Code & Gift', value: [
            '`,code <mã>` - Nhập code nhận thưởng',
            '`,gift <@user> <gold/gem> <số lượng>` - Tặng quà'
          ].join('\n') },
          { name: '⚙️ Hệ Thống', value: [
            '**Dungeon:** Tầng 1-100, boss mỗi 5 tầng',
            '**Quái:** Tăng mạnh theo tầng, sự kiện từ tầng 20',
            '**Speed:** Tối đa 130, ảnh hưởng lượt đánh & né',
            '**Class:** 7 class với kỹ năng riêng'
          ].join('\n') }
        )
        .setColor(0x00FF00)
    );

    const embed = pages[Math.min(page - 1, pages.length - 1)];

    const row = Math.floor((page - 1) / 1);
    message.reply({
      embeds: [embed],
      content: `📄 Trang **${Math.min(page, pages.length)}/${pages.length}** - Dùng \`,help <số trang>\` để xem trang khác`
    });
  }
};
