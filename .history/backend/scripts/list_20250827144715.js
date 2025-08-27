// scripts/seedAppointmentWithSchedule.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');

require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

const STATUSES = ['cancelled', 'pending', 'confirmed'];
const START_HOUR = 8;
const END_HOUR = 16;

const main = async () => {
  const doctorId = process.argv[2];
  const patientId = process.argv[3];

  if (!doctorId || !patientId) {
    console.error('Cách dùng: node scripts/seedAppointmentWithSchedule.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const doctor = await Doctor.findById(doctorId).populate('user', 'fullName email').lean();
    if (!doctor) throw new Error('Không tìm thấy bác sĩ');

    const patient = await Patient.findById(patientId).populate('user', 'fullName email').lean();
    if (!patient) throw new Error('Không tìm thấy bệnh nhân');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;
    const patientUserId = patient.user._id;

    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStr = todayVN.format('YYYY-MM-DD');

    // --- Xóa appointment cũ ---
    await Appointment.deleteMany({ doctor: doctorId, patient: patientUserId });
    console.log('✅ Đã xóa toàn bộ appointment cũ');

    // --- Lấy hoặc tạo Schedule cho hôm nay ---
    let schedule = await Schedule.findOne({ doctorId, date: todayStr });
    if (!schedule) {
      const slots = [];
      for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
        for (const minute of [0, 30]) {
          const slotTime = dayjs().tz('Asia/Ho_Chi_Minh').hour(hour).minute(minute).second(0).millisecond(0);
          if (slotTime.isAfter(todayVN)) {
            slots.push({ time: slotTime.format('HH:mm'), isBooked: false });
          }
        }
      }
      schedule = await Schedule.create({ doctorId, date: todayStr, slots });
      console.log('✅ Tạo mới Schedule hôm nay cho bác sĩ');
    }

    const availableSlots = schedule.slots.filter(s => !s.isBooked);
    const appointmentsToCreate = [];

    for (let i = 0; i < Math.min(STATUSES.length, availableSlots.length); i++) {
      const slot = availableSlots[i];
      const slotDateTimeVN = dayjs(`${todayStr}T${slot.time}`).tz('Asia/Ho_Chi_Minh');

      // Kiểm tra slot đã đặt chưa (tránh trùng)
      const exists = await Appointment.findOne({ doctor: doctorId, date: todayStr, time: slot.time });
      if (exists) continue;

      appointmentsToCreate.push({
        doctor: doctorId,
        patient: patientUserId,
        specialty: specialtyId,
        location: locationId,
        datetime: slotDateTimeVN.utc().toDate(),
        reason: `Cuộc hẹn demo trạng thái ${STATUSES[i]}`,
        status: STATUSES[i],
        isVerified: true,
      });

      // đánh dấu slot booked
      slot.isBooked = true;
    }

    if (appointmentsToCreate.length > 0) {
      await Appointment.insertMany(appointmentsToCreate);
      await schedule.save();
      console.log(`✅ Đã tạo ${appointmentsToCreate.length} appointment demo và cập nhật Schedule`);
    } else {
      console.log('⚠ Không có appointment nào được tạo');
    }

  } catch (err) {
    console.error('❌ Lỗi khi seed appointment:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Ngắt kết nối MongoDB');
  }
};

main();
