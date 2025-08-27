// scripts/seedAppointment.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

const STATUSES_TODAY = ['pending', 'confirmed', 'cancelled'];
const STATUS_YESTERDAY = 'completed';

const main = async () => {
  const doctorUserId = process.argv[2];
  const patientUserId = process.argv[3];

  if (!doctorUserId || !patientUserId) {
    console.error('Cách dùng: node scripts/seedAppointment.js <doctorUserId> <patientUserId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // --- Lấy doctor + patient ---
    const doctor = await Doctor.findOne({ user: doctorUserId }).populate('user');
    if (!doctor) throw new Error('Không tìm thấy bác sĩ');
    const patient = await User.findById(patientUserId);
    if (!patient || patient.role !== 'patient') throw new Error('Không tìm thấy bệnh nhân');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayVNStr = nowVN.format('YYYY-MM-DD');
    const yesterdayVN = nowVN.subtract(1, 'day');
    const yesterdayVNStr = yesterdayVN.format('YYYY-MM-DD');

    console.log(`🔹 Tạo cuộc hẹn demo cho Doctor ${doctor._id} và Patient ${patient._id}`);

    // --- Xóa appointment cũ hôm nay và hôm qua ---
    await Appointment.deleteMany({
      doctor: doctor._id,
      patient: patient._id,
      date: { $in: [todayVNStr, yesterdayVNStr] }
    });
    console.log('✅ Đã xóa appointment cũ');

    // --- Tạo / lấy schedule hôm nay ---
    let scheduleToday = await Schedule.findOne({ doctorId: doctor._id, date: todayVNStr });
    if (!scheduleToday) scheduleToday = await Schedule.create({ doctorId: doctor._id, date: todayVNStr, slots: [] });

    // --- Tạo appointments hôm nay ---
    const appointmentsToday = [];
    for (let status of STATUSES_TODAY) {
      let slotFound = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        const hour = 8 + Math.floor(Math.random() * 9); // 08 → 16
        const minute = Math.random() < 0.5 ? 0 : 30;
        const timeStr = `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
        const datetimeVN = nowVN.hour(hour).minute(minute).second(0).millisecond(0);

        if (datetimeVN.isBefore(nowVN)) continue;

        const exists = await Appointment.findOne({ doctor: doctor._id, date: todayVNStr, time: timeStr });
        if (exists) continue;

        const datetimeUTC = datetimeVN.utc().toDate();

        appointmentsToday.push({
          doctor: doctor._id,
          patient: patient._id,
          specialty: specialtyId,
          location: locationId,
          datetime: datetimeUTC,
          reason: `Demo ${status}`,
          status,
          isVerified: true,
          isDemo: true
        });

        // Cập nhật schedule
        const slotIndex = scheduleToday.slots.findIndex(s => s.time === timeStr);
        if (slotIndex >= 0) scheduleToday.slots[slotIndex].isBooked = true;
        else scheduleToday.slots.push({ time: timeStr, isBooked: true });

        slotFound = true;
        break;
      }
      if (!slotFound) console.log(`⚠ Không tìm được slot trống cho trạng thái ${status}`);
    }

    // --- Tạo appointment completed hôm qua ---
    const hour = 10;
    const minute = 0;
    const datetimeYesterdayUTC = yesterdayVN.hour(hour).minute(minute).second(0).millisecond(0).utc().toDate();
    appointmentsToday.push({
      doctor: doctor._id,
      patient: patient._id,
      specialty: specialtyId,
      location: locationId,
      datetime: datetimeYesterdayUTC,
      reason: 'Demo completed',
      status: STATUS_YESTERDAY,
      isVerified: true,
      isDemo: true
    });

    // --- Insert tất cả appointments ---
    const created = await Appointment.insertMany(appointmentsToday);
    console.log(`✅ Đã tạo ${created.length} cuộc hẹn demo`);

    // --- Lưu schedule hôm nay ---
    await scheduleToday.save();
    console.log('✅ Schedule hôm nay đã cập nhật');

  } catch (err) {
    console.error('❌ Lỗi khi seed appointment:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();
