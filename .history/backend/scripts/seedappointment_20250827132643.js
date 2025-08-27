const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
require('dotenv').config();

const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

dayjs.extend(utc);
dayjs.extend(timezone);

const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

const main = async () => {
  const doctorUserId = process.argv[2];
  const patientUserId = process.argv[3];

  if (!doctorUserId || !patientUserId) {
    console.error('⚠️ Cách dùng: node scripts/seedappointment.js <doctorUserId> <patientUserId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // --- Tự động lấy doctorId từ doctorUserId ---
    const doctorUser = await User.findOne({ _id: doctorUserId, role: 'doctor' });
    if (!doctorUser) throw new Error('❌ Không tìm thấy user doctor');
    const doctor = await Doctor.findOne({ user: doctorUser._id });
    if (!doctor) throw new Error('❌ Không tìm thấy doctor document');
    const doctorId = doctor._id;

    // --- Tự động lấy patientId từ patientUserId ---
    const patientUser = await User.findOne({ _id: patientUserId, role: 'patient' });
    if (!patientUser) throw new Error('❌ Không tìm thấy user patient');
    const patient = await Patient.findOne({ user: patientUser._id });
    if (!patient) throw new Error('❌ Không tìm thấy patient document');
    const patientId = patient._id;

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`🔹 Seed 4 appointment demo cho doctorUser ${doctorUserId} (doctorId=${doctorId}) và patientUser ${patientUserId} (patientId=${patientId})`);

    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayVNStr = nowVN.format('YYYY-MM-DD');

    // --- Xóa appointment cũ của doctor + patient hôm nay ---
    await Appointment.deleteMany({ doctor: doctorId, patient: patientId, date: todayVNStr });
    console.log('✅ Đã xóa toàn bộ appointment cũ hôm nay');

    // --- Lấy hoặc tạo Schedule hôm nay ---
    let schedule = await Schedule.findOne({ doctorId, date: todayVNStr });
    if (!schedule) {
      schedule = await Schedule.create({ doctorId, date: todayVNStr, slots: [] });
      console.log('✅ Tạo mới Schedule hôm nay');
    }

    const appointmentsToCreate = [];
    const usedSlots = new Set();

    for (let status of statuses) {
      let slotFound = false;

      for (let attempt = 0; attempt < 50; attempt++) {
        const hour = 8 + Math.floor(Math.random() * 9);
        const minute = Math.random() < 0.5 ? 0 : 30;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        if (usedSlots.has(timeStr)) continue;

        const datetimeVN = nowVN.hour(hour).minute(minute).second(0).millisecond(0);
        if (datetimeVN.isBefore(nowVN)) continue;

        const exists = await Appointment.findOne({
          doctor: doctorId,
          date: todayVNStr,
          time: timeStr,
          isDemo: { $ne: true }
        });
        if (exists) continue;

        const datetimeUTC = datetimeVN.utc().toDate();

        appointmentsToCreate.push({
          doctor: doctorId,
          patient: patientId,
          specialty: specialtyId,
          location: locationId,
          datetime: datetimeUTC,
          date: todayVNStr,
          time: timeStr,
          reason: `Cuộc hẹn demo trạng thái ${status}`,
          status,
          isVerified: true,
          isDemo: true
        });

        usedSlots.add(timeStr);

        const slotIndex = schedule.slots.findIndex(s => s.time === timeStr);
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
      await Appointment.insertMany(appointmentsToCreate);
      console.log(`✅ Đã tạo ${appointmentsToCreate.length} appointment demo`);
      await schedule.save();
      console.log('✅ Schedule được cập nhật');
    } else {
      console.log('⚠ Không tạo được appointment nào');
    }

  } catch (err) {
    console.error('❌ Lỗi khi seed appointment:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();




// const mongoose = require('mongoose');
// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');
// const Appointment = require('../models/Appointment');
// const Doctor = require('../models/Doctor');
// const User = require('../models/User');
// const Schedule = require('../models/Schedule');
// require('dotenv').config();

// dayjs.extend(utc);
// dayjs.extend(timezone);

// const statuses = ['cancelled', 'pending', 'confirmed'];

// const main = async () => {
//   const doctorId = process.argv[2];
//   const patientId = process.argv[3];

//   if (!doctorId || !patientId) {
//     console.error('Cách dùng: node scripts/seedappointment.js <doctorId> <patientId>');
//     process.exit(1);
//   }

//   await mongoose.connect(process.env.MONGODB_URI);

//   try {
//     const doctor = await Doctor.findById(doctorId).populate('user', 'fullName email');
//     if (!doctor) throw new Error('Không tìm thấy bác sĩ');

//     const specialtyId = doctor.specialty;
//     const locationId = doctor.location;

//     console.log(`🔹 Tạo các cuộc hẹn demo HÔM NAY cho bác sĩ: ${doctor._id}`);

//     // --- Xóa toàn bộ appointment hôm nay ---
//     const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
//     const todayVNStr = nowVN.format('YYYY-MM-DD');

//     await Appointment.deleteMany({ doctor: doctorId, date: todayVNStr });
//     console.log('✅ Đã xóa toàn bộ appointment demo cũ');

//     // --- Lấy hoặc tạo Schedule hôm nay ---
//     let schedule = await Schedule.findOne({ doctorId, date: todayVNStr });
//     if (!schedule) {
//       schedule = await Schedule.create({ doctorId, date: todayVNStr, slots: [] });
//       console.log('✅ Tạo mới Schedule hôm nay');
//     }

//     const appointmentsToCreate = [];

//     // --- Sinh các slot 30 phút từ 08:00 → 16:30 ---
//     for (let hour = 8; hour <= 16; hour++) {
//       for (const minute of [0, 30]) {
//         const timeStr = `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
//         let datetimeVN = nowVN.hour(hour).minute(minute).second(0).millisecond(0);

//         // Nếu slot đã qua, bỏ qua
//         if (datetimeVN.isBefore(nowVN)) {
//           console.log(`⚠ Slot ${timeStr} đã qua, bỏ qua`);
//           continue;
//         }

//         const datetimeUTC = datetimeVN.utc().toDate();

//         // --- Kiểm tra slot thực đã có appointment ---
//         const exists = await Appointment.findOne({
//           doctor: doctorId,
//           date: todayVNStr,
//           time: timeStr,
//           isDemo: { $ne: true }
//         });
//         if (exists) {
//           console.log(`⚠ Slot ${timeStr} đã có bệnh nhân thực, bỏ qua`);
//           continue;
//         }

//         appointmentsToCreate.push({
//           doctor: doctorId,
//           patient: patientId,
//           specialty: specialtyId,
//           location: locationId,
//           datetime: datetimeUTC,
//           date: todayVNStr,
//           time: timeStr,
//           reason: `Cuộc hẹn demo ${todayVNStr} ${timeStr}`,
//           status: statuses[(hour*2 + (minute/30)) % statuses.length],
//           isVerified: true,
//           isDemo: true
//         });

//         // --- Cập nhật Schedule slot ---
//         const slotIndex = schedule.slots.findIndex(s => s.time === timeStr);
//         if (slotIndex >= 0) {
//           schedule.slots[slotIndex].isBooked = true;
//         } else {
//           schedule.slots.push({ time: timeStr, isBooked: true });
//         }
//       }
//     }

//     if (appointmentsToCreate.length > 0) {
//       const created = await Appointment.insertMany(appointmentsToCreate);
//       console.log(`✅ Đã tạo ${created.length} cuộc hẹn demo HÔM NAY`);

//       await schedule.save();
//       console.log('✅ Schedule được cập nhật với các slot đã đặt');
//     } else {
//       console.log('⚠ Không có slot trống hôm nay để tạo cuộc hẹn demo');
//     }

//   } catch (err) {
//     console.error('❌ Lỗi khi tạo các cuộc hẹn demo hôm nay:', err);
//   } finally {
//     await mongoose.disconnect();
//     console.log('✅ Đã ngắt kết nối MongoDB');
//   }
// };

// main();
