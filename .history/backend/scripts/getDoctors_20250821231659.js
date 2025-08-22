require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location')

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const doctors = await User.find({ role: 'doctor' }).select('fullName email phone');

    console.log(`Tìm thấy ${doctors.length} bác sĩ:\n`);
    doctors.forEach((doc, idx) => {
      console.log(`${idx + 1}. ${doc.fullName} - ${doc.email} - ${doc.phone}`);
    });

    const doctors = await User.find({ role: 'doctor' }).select('fullName email phone');

    console.log(`Tìm thấy ${doctors.length} bác sĩ:\n`);
    doctors.forEach((doc, idx) => {
      console.log(`${idx + 1}. ${doc.fullName} - ${doc.email} - ${doc.phone}`);
    });
    await mongoose.disconnect();
    console.log('\n✅ MongoDB disconnected');
  } catch (err) {
    console.error('❌ Lỗi:', err);
  }
}

main();
