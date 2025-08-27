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

  await mongoose.connect(process.env.MONGO_URI, {});

  try {
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) throw new Error('Doctor not found');

    const specialtyId = doctor.specialty;
    const locationId = doctor.location;

    console.log(`Creating demo appointments for Doctor: ${doctor._id}, Specialty: ${specialtyId}, Location: ${locationId}`);

    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const appointmentsToCreate = [];

    // tạo appointment từ Thứ 2 → Chủ nhật
    const dayOfWeekVN = todayVN.day();
    const mondayVN = todayVN.subtract((dayOfWeekVN + 6) % 7, 'day'); // Thứ 2 đầu tuần

    for (let i = 0; i < 7; i++) {
      const dateVN = mondayVN.add(i, 'day');
      const dateStr = dateVN.format('YYYY-MM-DD');

      // giả lập 2 slot / ngày
      const times = ['09:00', '14:00'];

      times.forEach((time, idx) => {
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
      });
    }

    const created = await Appointment.insertMany(appointmentsToCreate);
    console.log(`✅ Created ${created.length} demo appointments`);

  } catch (err) {
    console.error('Error creating demo appointments:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

main();
