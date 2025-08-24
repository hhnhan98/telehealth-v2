// scripts/checkDoctorProfile.js
require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const doctors = await Doctor.find()
      .populate('user')
      .populate('specialty')
      .populate('location');

    console.log(`🔹 Tổng số Doctor documents: ${doctors.length}`);

    for (const doc of doctors) {
      const issues = [];

      // Kiểm tra reference thật
      if (!doc.user) issues.push('Missing User reference');
      if (!doc.specialty) issues.push('Missing Specialty reference');
      if (!doc.location) issues.push('Missing Location reference');

      // Kiểm tra virtuals lấy từ User
      if (!doc.fullName) issues.push('Missing fullName (from User)');
      if (!doc.phone) issues.push('Missing phone (from User)');

      // Kiểm tra bio thật (empty string hợp lệ)
      if (doc.bio === undefined || doc.bio === null) issues.push('Missing bio');

      if (issues.length > 0) {
        console.log(`❌ Doctor ${doc._id} issues: ${issues.join(', ')}`);
      } else {
        console.log(`✅ Doctor ${doc.user?.fullName || 'Unknown'} (${doc._id}) OK`);
      }
    }

    mongoose.connection.close();
    console.log('🎯 Kiểm tra Doctor documents hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra Doctor documents:', err);
    mongoose.connection.close();
  }
})();
