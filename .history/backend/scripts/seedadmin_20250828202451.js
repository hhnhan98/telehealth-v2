// scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // chỉnh đường dẫn nếu cần

// ===== Kết nối MongoDB =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => {
    console.error('*** Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    const email = 'admin@telehealth.com'; // Email admin mặc định
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Admin đã tồn tại!');
      process.exit(0);
    }

    const admin = new User({
      fullName: 'Administrator',
      email,
      password: '123456', // password plaintext, sẽ được hash bởi pre-save hook
      role: 'admin',
    });

    await admin.save();
    console.log('Tạo admin thành công:', email);
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi khi tạo admin:', err);
    process.exit(1);
  }
};

createAdmin();
