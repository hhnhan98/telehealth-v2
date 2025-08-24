/**
 * scripts/fixAllUsers.js
 * Kiểm tra và fix toàn bộ trường quan trọng của User
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telehealth';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const DEFAULT_AVATAR = '/uploads/default-avatar.png';
const DEFAULT_PHONE = '';
const DEFAULT_BIO = '';
const DEFAULT_BIRTHYEAR = null;
const DEFAULT_GENDER = 'other';

async function fixUsers() {
  try {
    const users = await User.find();

    for (const user of users) {
      const updates = {};

      // Avatar
      if (!user.avatar || user.avatar.trim() === '') updates.avatar = DEFAULT_AVATAR;

      // Phone (kiểm tra hợp lệ)
      const phoneValid = user.phone && (/^[0-9]{10}$/.test(user.phone) || user.phone === '');
      if (!phoneValid) updates.phone = DEFAULT_PHONE;

      // Bio
      if (!user.bio) updates.bio = DEFAULT_BIO;

      // BirthYear
      if (user.birthYear !== null && (typeof user.birthYear !== 'number' || user.birthYear < 1900 || user.birthYear > new Date().getFullYear())) {
        updates.birthYear = DEFAULT_BIRTHYEAR;
      }

      // Gender
      if (!['male', 'female', 'other'].includes(user.gender)) updates.gender = DEFAULT_GENDER;

      // Nếu có cập nhật
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
        console.log(`✅ Fixed user: ${user.fullName} (${user._id}) →`, updates);
      } else {
        console.log(`✅ User OK: ${user.fullName} (${user._id})`);
      }
    }

    console.log('🎯 All User documents checked and fixed!');
  } catch (err) {
    console.error('❌ Error fixing users:', err);
  } finally {
    mongoose.disconnect();
  }
}

fixUsers();
