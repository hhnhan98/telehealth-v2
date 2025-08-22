require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // đường dẫn đến model User

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Lấy toàn bộ user có role "doctor"
    const doctors = await User.find({ role: 'doctor' }).select('email fullName phone avatar');

    console.log(`Tìm thấy ${doctors.length} bác sĩ:`);
    doctors.forEach((doc, idx) => {
      console.log(`${idx + 1}. ${doc.fullName} - ${doc.email} - ${doc.phone}`);
    });

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    console.error('❌ Lỗi:', err);
  }
}

main();
