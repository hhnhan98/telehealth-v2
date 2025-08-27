/**
 * Usage: node resetAndSeedAppointments.js <doctorId> <patientId>
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
    console.error('Usage: node resetAndSeedAppointments.js <doctorId> <patientId>');
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

    // --- Seed demo appointments hôm nay (2 slot: 09:00, 14:00) ---
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStr = todayVN.format('YYYY-MM-DD');
    const times = ['09:00', '14:00'];

    const appointmentsToCreate = [];

    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const datetimeUTC = dayjs.tz(`${todayStr} ${time}`, 'Asia/Ho_Chi_Minh').utc().toDate();

      appointmentsToCreate.push({
        doctor: doctorId,
        patient: patientId,
        specialty: specialtyId,
        location: locationId,
        datetime: datetimeUTC,
        date: todayStr,
        time: time,
        reason: `Demo appointment ${todayStr} ${time}`,
        status: statuses[i % statuses.length],
        isVerified: true,
        isDemo: true
      });
    }

    const created = await Appointment.insertMany(appointmentsToCreate);
    console.log(`✅ Created ${created.length} demo appointments for today`);

    // --- Cập nhật Schedule ---
    let schedule = await Schedule.findOne({ doctorId, date: todayStr });
    if (!schedule) {
      schedule = await Schedule.create({
        doctorId,
        date: todayStr,
        slots: times.map(time => ({ time, isBooked: true }))
      });
      console.log('✅ Schedule created for today with booked slots');
    } else {
      // đánh dấu tất cả các slot seed là booked
      schedule.slots = schedule.slots.map(slot => 
        times.includes(slot.time) ? { ...slot.toObject(), isBooked: true } : slot
      );
      await schedule.save();
      console.log('✅ Schedule updated for today with booked slots');
    }

  } catch (err) {
    console.error('❌ Error in resetting & seeding appointments:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

main();
