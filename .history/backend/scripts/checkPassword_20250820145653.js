// scripts/checkPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // đường dẫn đến model User

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

async function checkPassword(email, rawPassword) {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
      return;
    }

    console.log('User password hash trong DB:', user.password);

    const isMatch = await bcrypt.compare(rawPassword.trim(), user.password);
    if (isMatch) {
      console.log('✅ Password đúng!');
    } else {
      console.log('❌ Password không đúng!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

// --- Thay đổi email và password để test
const testEmail = 'example@test.com';
const testPassword = '123456';

checkPassword(testEmail, testPassword);
