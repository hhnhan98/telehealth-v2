// scripts/listDoctorsWithSpecialtyAndLocation.js

require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Specialty = require('../models/Specialty');   // thêm
const Location = require('../models/Location');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Lấy toàn bộ bác sĩ, populate specialty & location, cùng user info
    const doctors = await Doctor.find({})
      .populate('user', 'fullName email phone')
      .populate('specialty', 'name')
      .populate('location', 'name');

    if (!doctors.length) {
      console.log('Không có bác sĩ nào trong DB.');
      return process.exit(0);
    }

    console.log('Danh sách bác sĩ:\n');
    doctors.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.user.fullName} - ${doc.user.email} - ${doc.user.phone || '-'}`);
      console.log(`   Chuyên khoa: ${doc.specialty?.name || '-'}`);
      console.log(`   Cơ sở y tế: ${doc.location?.name || '-'}`);
      console.log('-----------------------------');
    });

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
})();
