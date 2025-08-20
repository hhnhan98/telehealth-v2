// scripts/resetAdminPassword.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/User');

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const hashedPassword = await bcrypt.hash('123456', 10);

    const result = await User.updateOne(
      { email: 'admin@demo.com' },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      console.log('Admin chưa tồn tại, tạo mới admin...');
      const admin = new User({
        fullName: 'Admin',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin account created with password 123456');
    } else {
      console.log('Admin password has been reset to 123456');
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi khi reset password admin:', err);
  }
}

resetAdminPassword();
