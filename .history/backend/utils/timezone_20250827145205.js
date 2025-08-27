// scripts/seedAppointment.js
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { toUTC, toVN } = require('../utils/timezone');
const dayjs = require('dayjs');
require('dotenv').config();

const SLOT_TIMES = ['08:30', '09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30'];
const APPT_STATUSES = ['cancelled', 'pending', 'confirmed'];

if (process.argv.length < 4) {
  console.error('❌ Vui lòng cung cấp doctorId và patientId');
  process.exit(1);
}

const doctorId = process.argv[2];
const patientId = process.argv[3];

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`🔹 Seed 3 appointment demo hôm nay cho doctor ${doctorId} và patient ${patientId}`);

  try {
    // --- Xóa tất cả appointment cũ ---
    await Appointment.deleteMany({});
    console.log('✅ Đã xóa tất cả appointment cũ');

    // --- Lấy doctor và patient ---
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);
    if (!doctor || !patient) throw new Error('Doctor hoặc Patient không tồn tại');

    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const createdAppointments = [];

    for (let i = 0; i < APPT_STATUSES.length; i++) {
      // Chọn slot hợp lệ (không trùng, không quá khứ)
      const slot = SLOT_TIMES.find(t => {
        const dt = toUTC(`${todayVN} ${t}`);
        const dtVN = toVN(dt);
        const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
        return dtVN >= nowVN && !createdAppointments.some(a => a.time === t);
      });

      if (!slot) continue;

      const datetime = toUTC(`${todayVN} ${slot}`);
      const appointment = new Appointment({
        doctor: doctor._id,
        patient: patient.user,
        location: doctor.location,
        specialty: doctor.specialty,
        datetime,
        reason: `Cuộc hẹn demo trạng thái ${APPT_STATUSES[i]}`,
        status: APPT_STATUSES[i],
        isVerified: true,
      });

      await appointment.save();
      createdAppointments.push({ _id: appointment._id, time: slot });
    }

    if (createdAppointments.length === 0) {
      console.log('⚠ Không có appointment nào hợp lệ để seed');
    } else {
      console.log(`✅ Đã tạo ${createdAppointments.length} appointment demo`);
    }

  } catch (err) {
    console.error('❌ Lỗi khi seed appointment:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();
