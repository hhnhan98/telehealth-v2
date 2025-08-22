// scripts/checkDoctor.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

async function checkDoctors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    const doctors = await User.find({ role: 'doctor' });
    if (doctors.length === 0) {
      console.log('⚠️ Không có user role doctor nào');
      return;
    }

    for (const doc of doctors) {
      const doctorProfile = await Doctor.findOne({ user: doc._id });
      if (doctorProfile) {
        console.log(`✅ Doctor document tồn tại: ${doc.fullName} (${doc._id})`);
      } else {
        console.log(`❌ Chưa có Doctor document cho user: ${doc.fullName} (${doc._id})`);
      }
    }
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra Doctor documents:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDoctors();
