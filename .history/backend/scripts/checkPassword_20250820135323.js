// scripts/checkPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // đường dẫn tới model User

// Thay email và password cần kiểm tra
const emailToCheck = 'patient1@demo.com';
const plainPassword = '123456'; // mật khẩu bạn vừa đăng ký

async function checkPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: emailToCheck });
    if (!user) {
      console.log('❌ Không tìm thấy user với email:', emailToCheck);
      process.exit(0);
    }

    const match = await bcrypt.compare(plainPassword, user.password);
    console.log('User found:', user.email);
    console.log('Password hash stored:', user.password);
    console.log('Plain password matches hash?', match);

    if (match) {
      console.log('✅ Mật khẩu hợp lệ');
    } else {
      console.log('❌ Mật khẩu KHÔNG đúng');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

checkPassword();
