/**
 * Usage: node resetAndSeedWeekAppointments.js <doctorId> <patientId>
 * doctorId: ObjectId của bác sĩ từ collection doctors
 * patientId: ObjectId của bệnh nhân từ collection users/patients
 */

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

const statuses = ['pending', 'confirmed'];

const main = async () => {
  const doctorId = process.argv[2];
  const patientId = process.argv[3];

  if (!doctorId || !patientId) {
    console.error('Usage: node resetAndSeedWeekAppointments.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`📌 Resetting appointments for Doctor: ${doctorId}, Specialty: ${specialtyId}, Location: ${locationId}`);

    // --- Xóa toàn bộ appointment cũ (thực + demo) ---
    await Appointment.deleteMany({ doctor: doctorId });
    console.log('✅ All old appointments removed');

    // --- Xác định tuần hiện tại VN (Thứ 2 → Chủ nhật) ---
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const dayOfWeekVN = todayVN.day(); // 0=CN, 1=T2,...
    const mondayVN = todayVN.subtract((dayOfWeekVN + 6) % 7, 'day'); // Thứ 2 đầu tuần

    const times = ['09:00', '14:00'];
    const appointmentsToCreate = [];

    // --- Tạo appointments 7 ngày trong tuần ---
    for (let i = 0; i < 7; i++) {
      const dateVN = mondayVN.add(i, 'day');
      const dateStr = dateVN.format('YYYY-MM-DD');

      for (let idx = 0; idx < times.length; idx++) {
        const time = times[idx];
        const datetimeUTC = dayjs.tz(`${dateStr} ${time}`, 'Asia/Ho_Chi_Minh').utc().toDate();

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
          isDemo: true
        });
      }

      // --- Cập nhật hoặc tạo Schedule cho ngày ---
      let schedule = await Schedule.findOne({ doctorId, date: dateStr });
      const slotsForDay = times.map(time => ({ time, isBooked: true }));

      if (!schedule) {
        await Schedule.create({ doctorId, date: dateStr, slots: slotsForDay });
        console.log(`✅ Schedule created for ${dateStr}`);
      } else {
        // cập nhật slots nếu chưa có booked
        schedule.slots = schedule.slots.map(slot => 
          times.includes(slot.time) ? { ...slot.toObject(), isBooked: true } : slot
        );
        await schedule.save();
        console.log(`✅ Schedule updated for ${dateStr}`);
      }
    }

    const created = await Appointment.insertMany(appointmentsToCreate);
    console.log(`✅ Created ${created.length} demo appointments for the week`);

  } catch (err) {
    console.error('❌ Error in resetting & seeding weekly appointments:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

main();
