const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

const statuses = ['cancelled', 'pending', 'confirmed', 'completed'];

const main = async () => {
  const doctorUserId = process.argv[2];
  const patientUserId = process.argv[3];

  if (!doctorUserId || !patientUserId) {
    console.error('❌ Cách dùng: node scripts/seedappointment.js <doctorUserId> <patientUserId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // 🔹 Tìm doctor từ userId
    const doctor = await Doctor.findOne({ user: doctorUserId }).populate('user', 'fullName email');
    if (!doctor) throw new Error(`Không tìm thấy Doctor từ userId ${doctorUserId}`);

    // 🔹 Tìm patient từ userId
    const patient = await Patient.findOne({ user: patientUserId }).populate('user', 'fullName email');
    if (!patient) throw new Error(`Không tìm thấy Patient từ userId ${patientUserId}`);

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`🔹 Tạo các cuộc hẹn demo HÔM NAY cho bác sĩ: ${doctor.user.fullName} và bệnh nhân: ${patient.user.fullName}`);

    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayVNStr = nowVN.format('YYYY-MM-DD');

    // 🔹 Xóa appointment cũ hôm nay giữa 2 người
    await Appointment.deleteMany({ doctor: doctor._id, patient: patient._id, date: todayVNStr });
    console.log('✅ Đã xóa appointment cũ của doctor + patient hôm nay');

    // 🔹 Lấy hoặc tạo Schedule hôm nay
    let schedule = await Schedule.findOne({ doctorId: doctor._id, date: todayVNStr });
    if (!schedule) {
      schedule = await Schedule.create({ doctorId: doctor._id, date: todayVNStr, slots: [] });
      console.log('✅ Tạo mới Schedule hôm nay');
    }

    const appointmentsToCreate = [];

    for (let status of statuses) {
      let slotFound = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        const hour = 8 + Math.floor(Math.random() * 9); // 08h - 16h
        const minute = Math.random() < 0.5 ? 0 : 30;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const datetimeVN = nowVN.hour(hour).minute(minute).second(0).millisecond(0);

        if (datetimeVN.isBefore(nowVN)) continue;

        const exists = await Appointment.findOne({
          doctor: doctor._id,
          date: todayVNStr,
          time: timeStr,
        });
        if (exists) continue;

        const datetimeUTC = datetimeVN.utc().toDate();

        appointmentsToCreate.push({
          doctor: doctor._id,
          patient: patient._id, // ✅ đúng Patient._id
          specialty: specialtyId,
          location: locationId,
          datetime: datetimeUTC,
          date: todayVNStr,
          time: timeStr,
          reason: `Cuộc hẹn demo trạng thái ${status}`,
          status,
          isVerified: true,
          isDemo: true,
        });

        // Cập nhật Schedule
        const slotIndex = schedule.slots.findIndex((s) => s.time === timeStr);
        if (slotIndex >= 0) {
          schedule.slots[slotIndex].isBooked = true;
        } else {
          schedule.slots.push({ time: timeStr, isBooked: true });
        }

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
      console.log('✅ Schedule đã cập nhật');
    } else {
      console.log('⚠ Không tạo được cuộc hẹn demo nào hôm nay');
    }
  } catch (err) {
    console.error('❌ Lỗi khi tạo cuộc hẹn demo:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();
