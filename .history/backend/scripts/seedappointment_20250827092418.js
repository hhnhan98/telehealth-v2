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
    console.error('Cách dùng: node scripts/seedappointment.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const doctor = await Doctor.findById(doctorId).populate('user', 'fullName email');
    if (!doctor) throw new Error('Không tìm thấy bác sĩ');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`🔹 Tạo các cuộc hẹn demo HÔM NAY cho bác sĩ: ${doctor._id}`);

    // --- Xóa toàn bộ appointment hôm nay ---
    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayVNStr = nowVN.format('YYYY-MM-DD');

    await Appointment.deleteMany({ doctor: doctorId, date: todayVNStr });
    console.log('✅ Đã xóa toàn bộ appointment cũ (demo + thực)');

    // --- Lấy hoặc tạo Schedule hôm nay ---
    let schedule = await Schedule.findOne({ doctorId, date: todayVNStr });
    if (!schedule) {
      schedule = await Schedule.create({ doctorId, date: todayVNStr, slots: [] });
      console.log('✅ Tạo mới Schedule hôm nay');
    }

    const appointmentsToCreate = [];

    // --- Sinh các slot từ 9:00 → 17:00 ---
    for (let hour = 9; hour <= 17; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;

      let datetimeVN = nowVN.hour(hour).minute(0).second(0).millisecond(0);

      // Nếu slot đã qua, bỏ qua
      if (datetimeVN.isBefore(nowVN)) {
        console.log(`⚠ Slot ${timeStr} đã qua, bỏ qua`);
        continue;
      }

      const datetimeUTC = datetimeVN.utc().toDate();

      // --- Kiểm tra slot thực đã có appointment ---
      const exists = await Appointment.findOne({
        doctor: doctorId,
        date: todayVNStr,
        time: timeStr,
        isDemo: { $ne: true }
      });
      if (exists) {
        console.log(`⚠ Slot ${timeStr} đã có bệnh nhân thực, bỏ qua`);
        continue;
      }

      appointmentsToCreate.push({
        doctor: doctorId,
        patient: patientId,
        specialty: specialtyId,
        location: locationId,
        datetime: datetimeUTC,
        date: todayVNStr,
        time: timeStr,
        reason: `Cuộc hẹn demo ${todayVNStr} ${timeStr}`,
        status: statuses[hour % statuses.length],
        isVerified: true,
        isDemo: true
      });

      // --- Cập nhật Schedule slot ---
      const slotIndex = schedule.slots.findIndex(s => s.time === timeStr);
      if (slotIndex >= 0) {
        schedule.slots[slotIndex].isBooked = true;
      } else {
        schedule.slots.push({ time: timeStr, isBooked: true });
      }
    }

    if (appointmentsToCreate.length > 0) {
      const created = await Appointment.insertMany(appointmentsToCreate);
      console.log(`✅ Đã tạo ${created.length} cuộc hẹn demo HÔM NAY`);

      await schedule.save();
      console.log('✅ Schedule được cập nhật với các slot đã đặt');
    } else {
      console.log('⚠ Không có slot trống hôm nay để tạo cuộc hẹn demo');
    }

  } catch (err) {
    console.error('❌ Lỗi khi tạo các cuộc hẹn demo hôm nay:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();
