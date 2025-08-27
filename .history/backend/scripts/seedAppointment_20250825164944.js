// DoctocId: 68aad6e45ff3b5542b7b3068
// PatientId: 68aad6a25ff3b5542b7b3050
/**
 * scripts/createDemoAppointments.js
 * Usage: node scripts/createDemoAppointments.js <doctorId> <patientId>
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
    console.error('Usage: node createDemoAppointments.js <doctorId> <patientId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {});

  try {
    const doctor = await Doctor.findById(doctorId).populate('user', 'fullName email');
    if (!doctor) throw new Error('Doctor not found');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`Creating demo appointments for Doctor: ${doctor._id}, Specialty: ${specialtyId}, Location: ${locationId}`);

    // --- Xóa demo appointment cũ ---
    await Appointment.deleteMany({ doctor: doctorId, reason: /Demo appointment/i });
    console.log('✅ Old demo appointments removed');

    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const appointmentsToCreate = [];

    // Tạo appointment từ Thứ 2 → Chủ nhật
    const dayOfWeekVN = todayVN.day();
    const mondayVN = todayVN.subtract((dayOfWeekVN + 6) % 7, 'day'); // Thứ 2 đầu tuần

    for (let i = 0; i < 7; i++) {
      const dateVN = mondayVN.add(i, 'day');
      const dateStr = dateVN.format('YYYY-MM-DD');

      const times = ['09:00', '14:00'];

      // Lấy các appointment đã book của doctor trong ngày
      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        datetime: {
          $gte: dayjs.tz(`${dateStr} 00:00`, 'Asia/Ho_Chi_Minh').utc().toDate(),
          $lte: dayjs.tz(`${dateStr} 23:59`, 'Asia/Ho_Chi_Minh').utc().toDate()
        },
        reason: { $not: /Demo appointment/i }
      }).lean();

      const bookedTimes = bookedAppointments.map(a =>
        dayjs(a.datetime).tz('Asia/Ho_Chi_Minh').format('HH:mm')
      );

      times.forEach((time, idx) => {
        if (!bookedTimes.includes(time)) {
          const datetimeUTC = dayjs.tz(`${dateStr} ${time}`, 'Asia/Ho_Chi_Minh').utc().toDate();

          appointmentsToCreate.push({
            doctor: doctorId,
            patient: patientId,
            specialty: specialtyId,
            location: locationId,
            datetime: datetimeUTC,
            reason: `Demo appointment ${dateStr} ${time}`,
            status: statuses[idx % statuses.length],
            isVerified: true
          });
        } else {
          console.log(`⏭ Slot ${dateStr} ${time} already booked, skipping`);
        }
      });
    }

    if (appointmentsToCreate.length > 0) {
      const created = await Appointment.insertMany(appointmentsToCreate);
      console.log(`✅ Created ${created.length} demo appointments`);
    } else {
      console.log('⚠️ No available slots to create demo appointments this week');
    }

  } catch (err) {
    console.error('Error creating demo appointments:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

main();
