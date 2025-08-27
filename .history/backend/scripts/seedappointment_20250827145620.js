// scripts/seedAppointment.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

const statuses = ['cancelled', 'pending', 'confirmed'];

const main = async () => {
  const doctorId = process.argv[2];
  const patientId = process.argv[3];

  if (!doctorId || !patientId) {
    console.error('Usage: node seedTodayAppointments.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const doctor = await Doctor.findById(doctorId).populate('user', 'fullName email');
    if (!doctor) throw new Error('Doctor not found');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`Creating TODAY demo appointments for Doctor: ${doctor._id}`);

    // --- Xóa demo appointment hôm nay ---
    const todayVNStr = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    await Appointment.deleteMany({ doctor: doctorId, date: todayVNStr, isDemo: true });
    console.log('✅ Old today demo appointments removed');

    // --- Lấy hoặc tạo Schedule hôm nay ---
    let schedule = await Schedule.findOne({ doctorId, date: todayVNStr });
    if (!schedule) {
      schedule = await Schedule.create({ doctorId, date: todayVNStr, slots: [] });
    }

    const times = ['09:00', '14:00']; // Các slot demo hôm nay
    const appointmentsToCreate = [];

    for (let idx = 0; idx < times.length; idx++) {
      const time = times[idx];

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
