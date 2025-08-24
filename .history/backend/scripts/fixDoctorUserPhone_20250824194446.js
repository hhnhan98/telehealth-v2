// scripts/fixDoctorUserPhone.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const doctors = await User.find({ role: 'doctor' });
    console.log(`🔹 Tổng số User doctor: ${doctors.length}`);

    for (const user of doctors) {
      let updated = false;

      if (user.phone === undefined || user.phone === null) {
        user.phone = '';
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log(`✅ Fixed User ${user._id}: added missing phone`);
      } else {
        console.log(`✅ User ${user._id} OK`);
      }
    }

    mongoose.connection.close();
    console.log('🎯 Fix User.phone hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi khi fix User.phone:', err);
    mongoose.connection.close();
  }
})();
