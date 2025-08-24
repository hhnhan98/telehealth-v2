// scripts/fixDoctorDocs.js
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

    const doctors = await Doctor.find();
    console.log(`🔹 Tổng số Doctor documents: ${doctors.length}`);

    for (const doc of doctors) {
      let updated = false;

      // Chỉ fix bio thật, vì phone là virtual lấy từ User
      if (doc.bio === undefined || doc.bio === null) {
        doc.bio = '';
        updated = true;
      }

      if (updated) {
        await doc.save();
        console.log(`✅ Fixed Doctor ${doc._id}: added missing bio`);
      } else {
        console.log(`✅ Doctor ${doc._id} OK`);
      }
    }

    mongoose.connection.close();
    console.log('🎯 Fix Doctor documents hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi khi fix Doctor documents:', err);
    mongoose.connection.close();
  }
})();
