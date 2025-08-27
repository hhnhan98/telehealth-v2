// scripts/testSlotsNew.js
const mongoose = require('mongoose');
const { toVN, toUTC, formatVN } = require('../utils/timezone');
const ScheduleService = require('../services/schedule.service');
const Schedule = require('../models/Schedule');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth-v2';

// Hàm xóa schedule cũ trước test
const clearSchedule = async (doctorId, date) => {
  await Schedule.deleteMany({ doctorId, date });
};

// Hàm test
const testGetAvailableSlots = async (doctorId, date) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Xóa schedule cũ trước khi test
    await clearSchedule(doctorId, date);

    console.log(`\n>>> Testing getAvailableSlots for Doctor: ${doctorId}, Date: ${date}\n`);

    const availableSlots = await ScheduleService.getAvailableSlots(doctorId, date);

    console.log(`Total available slots: ${availableSlots.length}\n`);

    availableSlots.forEach((slot, index) => {
      console.log(
        `${index + 1}. timeStr: ${slot.time}, datetimeUTC: ${slot.datetimeUTC}, VN: ${slot.datetimeVN}`
      );
    });

    console.log('\n✅ Test completed and disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error testing getAvailableSlots:', err);
  } finally {
    await mongoose.disconnect();
  }
};

// ----- Chỉnh doctorId và date cần test -----
const doctorId = '68a70330cfc3626362efbb79';
const date = '2025-08-26';

testGetAvailableSlots(doctorId, date);
