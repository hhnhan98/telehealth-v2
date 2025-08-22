// checkPatient.js
require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');

async function checkPatient(userEmail) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Tìm user patient theo email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${userEmail}`);
      return;
    }

    console.log(`✅ User tìm thấy: ${user.fullName} (${user._id})`);

    // Kiểm tra Patient document
    const patient = await Patient.findOne({ user: user._id }).populate('user', 'fullName email');
    if (!patient) {
      console.log('❌ Không tìm thấy Patient document cho user này.');
    } else {
      console.log('✅ Patient document tồn tại:');
      console.log(patient);
    }
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra Patient:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Thay email bằng user patient bạn đang thử
checkPatient('patient_a@demo.com');
