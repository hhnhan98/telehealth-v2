// scripts/appointment.test.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Appointment = require('../models/Appointment');
const { toVN } = require('../utils/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth_test';

async function runTest() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Xóa test cũ
    await Appointment.deleteMany({});
    console.log('🧹 Đã xóa Appointment test cũ');

    // Tạo datetime UTC
    const utcDatetime = dayjs.utc('2025-08-25T03:30:00Z').toDate(); // 10:30 VN

    const newApp = await Appointment.create({
      location: new mongoose.Types.ObjectId(),
      specialty: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      patient: new mongoose.Types.ObjectId(),
      datetime: utcDatetime,
      reason: 'Test appointment',
    });

    console.log('📌 Appointment saved:');
    console.log({
      utc_datetime: newApp.datetime.toISOString(),
      vn_date: newApp.date,
      vn_time: newApp.time,
    });

    // So sánh expected
    const vnTime = toVN(newApp.datetime);
    console.log('✅ Expected VN:', {
      vn_date: dayjs(vnTime).format('YYYY-MM-DD'),
      vn_time: dayjs(vnTime).format('HH:mm'),
    });

    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTest();
