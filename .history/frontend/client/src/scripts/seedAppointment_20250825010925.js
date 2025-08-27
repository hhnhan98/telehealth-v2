// src/scripts/createTodayAppointment.js
require('dotenv').config();
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const Appointment = require('../models/Appointment');

const MONGODB_URI = process.env.MONGODB_URI;

const DOCTOR_ID = '64aad6e45ff3b5542b7b3066'; // thay bằng _id bác sĩ
const PATIENT_ID = '64aadb2345ff3b5542b7b307'; // thay bằng _id bệnh nhân
const LOCATION_ID = '64c123abc456def7890aaa12';
const SPECIALTY_ID = '64c123abc456def7890bbb34';

const createTodayAppointment = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('>>> Kết nối MongoDB thành công');

    // --- Thời gian hôm nay 10:00 sáng VN ---
    const vnDateTime = dayjs().tz('Asia/Ho_Chi_Minh').hour(10).minute(0).second(0);
    const utcDateTime = vnDateTime.utc().toDate();

    const newAppointment = await Appointment.create({
      doctor: DOCTOR_ID,
      patient: 68aad6a25ff3b5542b7b304e,
      location: LOCATION_ID,
      specialty: SPECIALTY_ID,
      datetime: utcDateTime,
      date: vnDateTime.format('YYYY-MM-DD'),
      time: vnDateTime.format('HH:mm'),
      reason: 'Kiểm tra thử dashboard',
      status: 'pending',
      isVerified: false,
    });

    console.log('✅ Tạo appointment thành công:');
    console.log(newAppointment);

    await mongoose.disconnect();
    console.log('>>> Ngắt kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi tạo appointment:', err);
  }
};

createTodayAppointment();
