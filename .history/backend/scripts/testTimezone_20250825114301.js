// scripts/testTimezone.js
require('dotenv').config();
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { toUTC, formatVN } = require('../utils/timezone');
const Appointment = require('../models/Appointment');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

async function testTimezone() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Thời gian VN muốn tạo appointment
    const vnDate = '2025-08-25';
    const vnTime = '10:30';

    // Chuyển VN sang UTC trước khi lưu
    const datetimeUTC = toUTC(`${vnDate} ${vnTime}`);
    console.log('➡ VN input:', `${vnDate} ${vnTime}`);
    console.log('➡ Converted to UTC:', datetimeUTC);

    // Tạo appointment test
    const appointment = await Appointment.create({
      location: new mongoose.Types.ObjectId(),
      specialty: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      patient: new mongoose.Types.ObjectId(),
      datetime: datetimeUTC,
      reason: 'Test timezone',
      otp: '123456',
      otpExpiresAt: dayjs().add(5, 'minute').toDate(),
      status: 'pending',
      isVerified: false
    });

    console.log('--- Appointment saved ---');
    console.log('Stored UTC datetime:', appointment.datetime);
    console.log('Auto-generated VN date field:', appointment.date);
    console.log('Auto-generated VN time field:', appointment.time);
    console.log('Convert back to VN with formatVN():', formatVN(appointment.datetime));

    // Clean up
    await Appointment.findByIdAndDelete(appointment._id);

    console.log('✅ Test completed and appointment deleted');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testTimezone();
