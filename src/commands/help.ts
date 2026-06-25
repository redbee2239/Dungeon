import { EmbedBuilder } from 'discord.js';

export const prefixCommand = {
  name: 'help',
  description: 'Xem danh sách lệnh',
  execute: async (message: any, args: string[]) => {
    const embed = new EmbedBuilder()
      .setTitle('📖 Hướng Dẫn')
      .setDescription('Dungeon Crawler Bot -.prefix là `,`')
      .addFields(
        { name: '🎮 Cơ Bản', value: [
          '`,create <class>` - Tạo nhân vật (warrior/mage/rogue/cleric/gladiator)',
          '`,profile` - Xem thông tin nhân vật',
          '`,help` - Xem danh sách lệnh'
        ].join('\n') },
        { name: '⚔️ Combat', value: [
          '`,dungeon` - Vào dungeon đánh quái',
          '`,dungeon <số>` - Chọn tầng dungeon',
          '`,heal` - Hồi phục HP/MP'
        ].join('\n') },
        { name: '📦 Vật Phẩm', value: [
          '`,inventory` - Xem hành trang',
          '`,shop buy` - Mua đồ',
          '`,shop sell` - Bán đồ'
        ].join('\n') },
        { name: '🎯 Kỹ Năng', value: [
          '`,skills` - Xem kỹ năng',
          '`,learn <id>` - Học kỹ năng',
          '`,stat` - Xem/nâng chỉ số'
        ].join('\n') },
        { name: '⚔️ Trang Bị', value: [
          '`,equip <id>` - Trang bị',
          '`,equip list` - Xem trang bị',
          '`,unequip <weapon/armor/accessory>` - Tháo trang bị'
        ].join('\n') },
        { name: '🎰 Gacha', value: [
          '`,gacha 1` - Quay 1 lần (50 💎)',
          '`,gacha 10` - Quay 10 lần (450 💎)',
          '`,gacha history` - Xem lịch sử'
        ].join('\n') },
        { name: '🏆 Khác', value: [
          '`,leaderboard` - Bảng xếp hạng',
          '`,balance` - Xem số dư',
          '`,chest` - Xem rương'
        ].join('\n') }
      )
      .setColor(0x0099FF);

    message.reply({ embeds: [embed] });
  }
};
