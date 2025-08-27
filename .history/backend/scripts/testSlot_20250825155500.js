// scripts/testSlotsNew.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { toVN, toUTC } = require('../utils/timezone');
const ScheduleService = require('../services/schedule.service');
const Doctor = require('../models/Doctor');
require('dotenv').config();

// Thay đổi URL MongoDB của bạn nếu cần
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telehealth-v2';

const testAvailableSlots = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    // Chọn 1 doctorId có trong DB để test
    const doctor = await Doctor.findOne().lean();
    if (!doctor) {
      console.error('❌ Không tìm thấy doctor trong DB');
      process.exit(1);
    }

    const doctorId = doctor._id.toString();
    const date = dayjs().add(1, 'day').format('YYYY-MM-DD'); // Lấy ngày mai để test

    console.log(`\n>>> Testing getAvailableSlots for Doctor: ${doctorId}, Date: ${date}\n`);

    const slots = await ScheduleService.getAvailableSlots(doctorId, date);

    console.log(`Total available slots: ${slots.length}\n`);
    slots.forEach((s, idx) => {
      console.log(
        `${idx + 1}. timeStr: ${s.time}, datetimeUTC: ${s.datetimeUTC || toUTC(`${date} ${s.time}`)}, VN: ${s.datetimeVN}`
      );
    });

    await mongoose.disconnect();
    console.log('\n✅ Test completed and disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error in testAvailableSlots:', err);
    process.exit(1);
  }
};

testAvailableSlots();
