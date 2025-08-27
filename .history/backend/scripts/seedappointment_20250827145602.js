// scripts/seedAppointment.js
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { toUTC, toVN } = require('../utils/timezone');
const dayjs = require('dayjs');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

const statuses = ['cancelled', 'pending', 'confirmed'];

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔹 Connected to MongoDB');

    // Xóa tất cả appointment cũ
    await Appointment.deleteMany({});
    console.log('✅ Đã xóa tất cả appointment cũ');

    // Lấy doctor + patient info
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      console.log('❌ Doctor hoặc Patient không tồn tại');
      return;
    }

    const now = dayjs();
    const today = now.format('YYYY-MM-DD');

    const appointmentsToSeed = [];

    for (let i = 0; i < 3; i++) {
      const status = APPOINTMENT_STATUSES[i];
      const slotTime = DEFAULT_SLOTS[i];

      // Tạo datetime theo VN
      const vnDateTimeStr = `${today}T${slotTime}:00+07:00`;
      const datetime = toUTC(new Date(vnDateTimeStr));

      // Không cho phép quá khứ
      if (datetime < new Date()) continue;

      // Kiểm tra trùng
      const exists = await Appointment.findOne({
        doctor: doctorId,
        date: today,
        time: slotTime,
      });
      if (exists) continue;

      appointmentsToSeed.push({
        location: doctor.location,
        specialty: doctor.specialty,
        doctor: doctorId,
        patient: patientId,
        datetime,
        date: today,
        time: slotTime,
        reason: `Cuộc hẹn demo trạng thái ${status}`,
        isVerified: true,
        status,
      });
    }

    if (appointmentsToSeed.length === 0) {
      console.log('⚠ Không có appointment nào hợp lệ để seed');
    } else {
      const inserted = await Appointment.insertMany(appointmentsToSeed);
      console.log(`✅ Seed thành công ${inserted.length} appointment demo`);
    }

  } catch (err) {
    console.error('❌ Lỗi khi seed appointment:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();
