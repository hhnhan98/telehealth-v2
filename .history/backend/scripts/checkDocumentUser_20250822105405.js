// scripts/checkUserDocs.js
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const checkDocuments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const users = await User.find().lean();
    if (!users.length) {
      console.log('⚠️ Không có user nào trong database');
      return;
    }

    for (const user of users) {
      if (user.role === 'patient') {
        const patientDoc = await Patient.findOne({ user: user._id });
        if (patientDoc) {
          console.log(`✅ Patient document tồn tại: ${user.fullName} (${user._id})`);
        } else {
          console.log(`❌ Chưa có Patient document: ${user.fullName} (${user._id})`);
        }
      } else if (user.role === 'doctor') {
        const doctorDoc = await Doctor.findOne({ user: user._id });
        if (doctorDoc) {
          console.log(`✅ Doctor document tồn tại: ${user.fullName} (${user._id})`);
        } else {
          console.log(`❌ Chưa có Doctor document: ${user.fullName} (${user._id})`);
        }
      } else {
        console.log(`⚠️ User role không xác định: ${user.fullName} (${user.role})`);
      }
    }

    console.log('🎯 Kiểm tra hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi kiểm tra document:', err);
  } finally {
    mongoose.connection.close();
  }
};

checkDocuments();
