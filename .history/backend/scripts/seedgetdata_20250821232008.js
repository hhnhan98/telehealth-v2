require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Specialty = require('../models/Specialty');   // thêm
const Location = require('../models/Location');     // thêm

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const doctors = await Doctor.find({})
      .populate('user', 'fullName email phone')
      .populate('specialty', 'name')
      .populate('location', 'name');

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
