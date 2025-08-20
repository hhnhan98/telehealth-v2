// scripts/testpw.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // phải cùng loại với seed
const User = require('../models/User');
require('dotenv').config();

async function testPw() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'patient1@demo.com';  // email đã seed
    const plainPassword = '123456';     // mật khẩu seed

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log('Password match:', isMatch); // true nếu đúng

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

testPw();
