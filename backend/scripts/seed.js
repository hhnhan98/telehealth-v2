const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Specialty = require('../models/Specialty');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ Kết nối MongoDB thành công');
  seedData();
}).catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

async function seedData() {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Specialty.deleteMany({});
    console.log('🧹 Đã xóa dữ liệu cũ');

    // Tạo các chuyên khoa trước
    const specialties = await Specialty.insertMany([
      { name: 'Tim mạch' },
      { name: 'Nội tiết' },
      { name: 'Tiêu hóa' },
    ]);
    console.log('✅ Đã seed chuyên khoa');

    // Lấy ObjectId của từng chuyên khoa
    const timMach = specialties.find(s => s.name === 'Tim mạch');
    const noiTiet = specialties.find(s => s.name === 'Nội tiết');

    const salt = await bcrypt.genSalt(10);

    await User.insertMany(users);
    console.log('✅ Seed user thành công!');
    console.table(users.map(u => ({
      Họ_tên: u.fullName,
      Email: u.email,
      Mật_khẩu: '123456',
      Vai_trò: u.role,
    })));

    process.exit();
  } catch (err) {
    console.error('❌ Lỗi seed:', err);
    process.exit(1);
  }
}
