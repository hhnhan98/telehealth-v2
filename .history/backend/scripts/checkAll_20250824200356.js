require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    const doctors = await Doctor.find().populate('user').populate('specialty').populate('location');
    console.log(`🔹 Tổng số Doctor documents: ${doctors.length}`);

    let issuesFound = false;

    for (const doc of doctors) {
      const issues = [];

      // Kiểm tra User
      if (!doc.user) {
        issues.push('Missing User reference');
      } else {
        if (!doc.user.fullName) issues.push('User fullName missing');
        if (!doc.user.phone) issues.push('User phone missing or invalid');
        if (!doc.user.email) issues.push('User email missing');
      }

      // Kiểm tra Doctor
      if (!doc.specialty) issues.push('Missing Specialty reference');
      if (!doc.location) issues.push('Missing Location reference');
      if (!doc.bio) issues.push('Doctor bio missing (can be empty string, ok)');

      if (issues.length > 0) {
        console.log(`❌ Doctor ${doc._id} (${doc.user?.fullName || 'Unknown User'}) issues: ${issues.join(', ')}`);
        issuesFound = true;
      } else {
        console.log(`✅ Doctor ${doc.user.fullName} (${doc._id}) OK`);
      }
    }

    // Kiểm tra User riêng lẻ
    const users = await User.find();
    for (const user of users) {
      const userIssues = [];
      if (!user.fullName) userIssues.push('fullName missing');
      if (!user.phone || !/^$|^[0-9]{10}$/.test(user.phone)) userIssues.push('phone missing or invalid');
      if (!user.email) userIssues.push('email missing');

      if (userIssues.length > 0) {
        console.log(`❌ User ${user._id} (${user.fullName || 'Unknown'}) issues: ${userIssues.join(', ')}`);
        issuesFound = true;
      }
    }

    if (!issuesFound) console.log('🎯 Tất cả Doctor và User documents đều hợp lệ');

    mongoose.connection.close();
    console.log('✅ Kiểm tra hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra Doctor/User documents:', err);
    mongoose.connection.close();
  }
})();
