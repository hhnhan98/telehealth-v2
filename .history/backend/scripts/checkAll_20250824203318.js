// scripts/checkAllUserFields.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    const users = await User.find().populate('specialty').populate('location');
    console.log(`🔹 Tổng số User documents: ${users.length}`);

    for (const user of users) {
      const issues = [];

      if (!user.fullName || user.fullName.trim().length < 2) issues.push('fullName missing or too short');
      if (!user.email || !/.+@.+\..+/.test(user.email)) issues.push('email missing or invalid');
      if (!['patient', 'doctor', 'admin'].includes(user.role)) issues.push('role missing or invalid');
      if (user.birthYear !== null && (user.birthYear < 1900 || user.birthYear > new Date().getFullYear())) issues.push('birthYear invalid');
      if (!['male', 'female', 'other'].includes(user.gender)) issues.push('gender invalid');
      if (!user.avatar) issues.push('avatar missing');
      if (user.bio === undefined || user.bio === null) issues.push('bio missing');
      if (user.specialty === null && user.role === 'doctor') issues.push('specialty missing for doctor');
      if (user.location === null && user.role === 'doctor') issues.push('location missing for doctor');

      if (issues.length > 0) {
        console.log(`❌ User ${user._id} (${user.fullName || 'No Name'}) issues: ${issues.join(', ')}`);
      } else {
        console.log(`✅ User ${user.fullName} (${user._id}) OK`);
      }
    }

    mongoose.connection.close();
    console.log('🎯 Kiểm tra User documents hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra User documents:', err);
    mongoose.connection.close();
  }
})();
