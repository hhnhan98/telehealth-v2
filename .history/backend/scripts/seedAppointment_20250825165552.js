// DoctocId: 68aad6e45ff3b5542b7b3068
// PatientId:  
/**
 * scripts/seedDemoAppointments.js
 * Usage: node scripts/seedDemoAppointments.js <doctorId> <patientId>
 * 
 * Demo tạo appointment từ Thứ 2 → Chủ nhật
 * Slot: 09:00 và 14:00 mỗi ngày
 */

const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);

const statuses = ['pending', 'confirmed'];

const main = async () => {
  const doctorId = process.argv[2];
  const patientId = process.argv[3];

  if (!doctorId || !patientId) {
    console.error('Usage: node seedDemoAppointments.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const doctor = await Doctor.findById(doctorId).populate('user', 'fullName email');
    if (!doctor) throw new Error('Doctor not found');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`Creating demo appointments for Doctor: ${doctor._id}, Specialty: ${specialtyId}, Location: ${locationId}`);

    // --- Xóa demo appointment cũ ---
    await Appointment.deleteMany({ doctor: doctorId, isDemo: true });
    console.log('✅ Old demo appointments removed');

    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const dayOfWeekVN = todayVN.day(); // 0=CN
    const mondayVN = todayVN.subtract((dayOfWeekVN + 6) % 7, 'day'); // Thứ 2 đầu tuần

    const appointmentsToCreate = [];

    for (let i = 0; i < 7; i++) {
      const dateVN = mondayVN.add(i, 'day');
      const dateStr = dateVN.format('YYYY-MM-DD');

      const times = ['09:00', '14:00'];

      for (let idx = 0; idx < times.length; idx++) {
        const time = times[idx];
        const datetimeUTC = dayjs.tz(`${dateStr} ${time}`, 'Asia/Ho_Chi_Minh').utc().toDate();

        // --- Kiểm tra slot đã có appointment thực ---
        const exists = await Appointment.findOne({
          doctor: doctorId,
          date: dateStr,
          time: time,
          isDemo: { $ne: true } // chỉ check appointment thực
        });

        if (exists) {
          console.log(`⚠ Slot ${dateStr} ${time} đã có bệnh nhân thực, bỏ qua`);
          continue;
        }

        appointmentsToCreate.push({
          doctor: doctorId,
          patient: patientId,
          specialty: specialtyId,
          location: locationId,
          datetime: datetimeUTC,
          date: dateStr,
          time: time,
          reason: `Demo appointment ${dateStr} ${time}`,
          status: statuses[idx % statuses.length],
          isVerified: true,
          isDemo: true // đánh dấu demo
        });
      }
    }

    if (appointmentsToCreate.length > 0) {
      const created = await Appointment.insertMany(appointmentsToCreate);
      console.log(`✅ Created ${created.length} demo appointments`);
    } else {
      console.log('⚠ Không có slot trống để tạo demo appointment');
    }

  } catch (err) {
    console.error('Error creating demo appointments:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

main();
