/**
 * Usage: node scripts/seedAppointment.js <doctorId> <patientId>
 */

const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { to}
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

// --- Chuyển datetime về VN
const toVN = (dt) => dayjs(dt).tz('Asia/Ho_Chi_Minh').toDate();

// Khung giờ seed (VN)
const SLOT_TIMES = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'];

// Trạng thái demo
const DEMO_STATUSES = ['cancelled', 'pending', 'confirmed'];

const main = async () => {
  const [doctorId, patientId] = process.argv.slice(2);
  if (!doctorId || !patientId) {
    console.error('❌ Usage: node seedAppointment.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    console.log(`🔹 Seed 3 appointment demo hôm nay cho doctor ${doctorId} và patient ${patientId}`);

    // --- Xóa triệt để tất cả appointments cũ của cặp doctor-patient
    await Appointment.deleteMany({ doctor: doctorId, patient: patientId });
    console.log('✅ Đã xóa tất cả appointment cũ');

    const doctor = await Doctor.findById(doctorId).populate('user specialty location');
    if (!doctor) throw new Error('Doctor không tồn tại');

    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) throw new Error('Patient không tồn tại');

    // Lấy ngày hôm nay VN
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh').startOf('day');

    const appointmentsToCreate = [];

    for (let i = 0; i < DEMO_STATUSES.length; i++) {
      const time = SLOT_TIMES[i];
      const [hour, minute] = time.split(':').map(Number);

      // Build datetime VN
      const datetimeVN = todayVN.hour(hour).minute(minute).second(0).toDate();

      // Không tạo appointment quá khứ
      if (datetimeVN < new Date()) continue;

      // Kiểm tra trùng slot
      const dateStr = dayjs(datetimeVN).format('YYYY-MM-DD');
      const timeStr = dayjs(datetimeVN).format('HH:mm');
      const exists = await Appointment.findOne({
        doctor: doctorId,
        date: dateStr,
        time: timeStr,
      });
      if (exists) {
        console.log(`⚠ Slot ${timeStr} đã được đặt, bỏ qua`);
        continue;
      }

      appointmentsToCreate.push({
        location: doctor.location._id,
        specialty: doctor.specialty._id,
        doctor: doctor._id,
        patient: patient._id,
        datetime: datetimeVN,
        reason: `Cuộc hẹn demo trạng thái ${DEMO_STATUSES[i]}`,
        status: DEMO_STATUSES[i],
        isVerified: true,
      });
    }

    if (appointmentsToCreate.length === 0) {
      console.log('⚠ Không có appointment nào hợp lệ để seed');
    } else {
      const inserted = await Appointment.insertMany(appointmentsToCreate);
      console.log(`✅ Đã seed ${inserted.length} appointment demo`);
      inserted.forEach((ap) => {
        console.log(`- ${ap.status} lúc ${ap.time}`);
      });
    }
  } catch (err) {
    console.error('❌ Lỗi khi seed appointment:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  }
};

main();
