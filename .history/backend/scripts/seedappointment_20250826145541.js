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
    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayVNStr = nowVN.format('YYYY-MM-DD');

await Appointment.deleteMany({ doctor: doctorId, date: todayVNStr });
console.log('✅ Old today appointments removed (demo + thực)');

    // --- Lấy hoặc tạo Schedule hôm nay ---
    let schedule = await Schedule.findOne({ doctorId, date: todayVNStr });
    if (!schedule) {
      schedule = await Schedule.create({ doctorId, date: todayVNStr, slots: [] });
    }

    const times = ['09:00', '14:00']; // Các slot demo hôm nay
    const appointmentsToCreate = [];

    for (let idx = 0; idx < times.length; idx++) {
      const [hour, minute] = times[idx].split(':').map(Number);

      // --- Tạo datetime VN và chuyển sang UTC ---
      let datetimeVN = nowVN.hour(hour).minute(minute).second(0).millisecond(0);

      // Nếu slot đã qua, bỏ qua
      if (datetimeVN.isBefore(nowVN)) {
        console.log(`⚠ Slot ${times[idx]} đã qua, bỏ qua`);
        continue;
      }

      const datetimeUTC = datetimeVN.utc().toDate();

      // --- Kiểm tra slot thực đã có appointment ---
      const exists = await Appointment.findOne({
        doctor: doctorId,
        date: todayVNStr,
        time: times[idx],
        isDemo: { $ne: true }
      });
      if (exists) {
        console.log(`⚠ Slot ${times[idx]} đã có bệnh nhân thực, bỏ qua`);
        continue;
      }

      appointmentsToCreate.push({
        doctor: doctorId,
        patient: patientId,
        specialty: specialtyId,
        location: locationId,
        datetime: datetimeUTC,
        date: todayVNStr,
        time: times[idx],
        reason: `Demo appointment ${todayVNStr} ${times[idx]}`,
        status: statuses[idx % statuses.length],
        isVerified: true,
        isDemo: true
      });

      // --- Cập nhật Schedule slot ---
      const slotIndex = schedule.slots.findIndex(s => s.time === times[idx]);
      if (slotIndex >= 0) {
        schedule.slots[slotIndex].isBooked = true;
      } else {
        schedule.slots.push({ time: times[idx], isBooked: true });
      }
    }

    if (appointmentsToCreate.length > 0) {
      const created = await Appointment.insertMany(appointmentsToCreate);
      console.log(`✅ Created ${created.length} TODAY demo appointments`);

      await schedule.save();
      console.log('✅ Schedule updated with booked slots');
    } else {
      console.log('⚠ Không có slot trống hôm nay để tạo demo appointment');
    }

  } catch (err) {
    console.error('Error creating today demo appointments:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

main();
