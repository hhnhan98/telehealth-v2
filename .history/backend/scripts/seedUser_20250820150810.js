// scripts/seedUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telehealth';

async function seedUser() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // --- Xóa user test cũ (nếu có)
    await User.deleteOne({ email: 'patient1@demo.com' });

    // --- Tạo user mới
    const user = new User({
      fullName: 'Bệnh nhân 1',
      email: 'patient1@demo.com',
      password: '123456', // sẽ được hash tự động
      role: 'patient',
    });

    await user.save();
    console.log('✅ User test created:');
    console.log({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      passwordHash: user.password,
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error seeding user:', err);
    mongoose.disconnect();
  }
}

seedUser();
