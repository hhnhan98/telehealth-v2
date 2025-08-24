// scripts/checkDoctorProfile.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const doctors = await Doctor.find().populate('user').populate('specialty').populate('location');
    console.log(`🔹 Tổng số Doctor documents: ${doctors.length}`);

    for (const doc of doctors) {
      const issues = [];

      if (!doc.user) issues.push('Missing User reference');
      if (!doc.specialty) issues.push('Missing Specialty reference');
      if (!doc.location) issues.push('Missing Location reference');
      if (!doc.fullName) issues.push('Missing fullName');
      if (!doc.phone) issues.push('Missing phone');
      if (!doc.bio) issues.push('Missing bio');

      if (issues.length > 0) {
        console.log(`❌ Doctor ${doc._id} issues: ${issues.join(', ')}`);
      } else {
        console.log(`✅ Doctor ${doc.user.fullName} (${doc._id}) OK`);
      }
    }

    mongoose.connection.close();
    console.log('🎯 Kiểm tra hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra Doctor documents:', err);
    mongoose.connection.close();
  }
})();
