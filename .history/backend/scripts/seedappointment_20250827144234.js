// scripts/seedSinglePair.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Schedule = require('../models/Schedule');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

const STATUSES = ['cancelled', 'pending', 'confirmed'];

const main = async () => {
  const doctorId = process.argv[2];
  const patientId = process.argv[3];

  if (!doctorId || !patientId) {
    console.error('Cách dùng: node scripts/seedSinglePair.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const doctor = await Doctor.findById(doctorId).populate('user', 'fullName email');
    if (!doctor) throw new Error('Không tìm thấy bác sĩ');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`🔹 Seed 3 appointment demo hôm nay cho doctor ${doctor._id} và patient ${patientId}`);

    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStr = nowVN.format('YYYY-MM-DD');

    // --- Xóa mọi appointment cũ (demo + thực) hôm nay ---
    await Appointment.deleteMany({ doctor: doctorId, patient: patientId, date: todayStr });
    console.log('✅ Đã xóa tất cả appointment cũ');

    // --- Lấy hoặc tạo Schedule hôm nay ---
    let schedule = await Schedule.findOne({ doctorId, date: todayStr });
    if (!schedule) {
      schedule = await Schedule.create({ doctorId, date: todayStr, slots: [] });
      console.log('✅ Tạo mới Schedule hôm nay');
    }

    const appointmentsToCreate = [];

    for (let status of STATUSES) {
      let slotFound = false;

      for (let attempt = 0; attempt < 50; attempt++) { // thử tối đa 50 lần
        const hour = 8 + Math.floor(Math.random() * 9); // 08 → 16
        const minute = Math.random() < 0.5 ? 0 : 30;
        const timeStr = `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;

        const datetimeVN = nowVN.hour(hour).minute(minute).second(0).millisecond(0);

        // --- Không cho phép đặt quá khứ ---
        if (datetimeVN.isBefore(nowVN)) continue;

        // --- Kiểm tra trùng appointment ---
        const exists = await Appointment.findOne({ doctor: doctorId, date: todayStr, time: timeStr });
        if (exists) continue;

        const datetimeUTC = datetimeVN.utc().toDate();

        appointmentsToCreate.push({
          doctor: doctorId,
          patient: patientId,
          specialty: specialtyId,
          location: locationId,
          datetime: datetimeUTC,
          date: todayStr,
          time: timeStr,
          reason: `Cuộc hẹn demo trạng thái ${status}`,
          status,
          isVerified: true,
          isDemo: true
        });

        // --- Cập nhật Schedule ---
        const slotIndex = schedule.slots.findIndex(s => s.time === timeStr);
        if (slotIndex >= 0) schedule.slots[slotIndex].isBooked = true;
        else schedule.slots.push({ time: timeStr, isBooked: true });

        slotFound = true;
        break;
      }

      if (!slotFound) {
        console.log(`⚠ Không tìm được slot trống cho trạng thái ${status}`);
      }
    }

    if (appointmentsToCreate.length > 0) {
      const created = await Appointment.insertMany(appointmentsToCreate);
      console.log(`✅ Đã tạo ${created.length} cuộc hẹn demo`);

      await schedule.save();
      console.log('✅ Schedule được cập nhật');
    } else {
      console.log('⚠ Không có slot trống hôm nay để tạo appointment demo');
    }

  } catch (err) {
    console.error('❌ Lỗi khi seed appointment:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();
