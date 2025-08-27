// scripts/checkDoctorDashboardDirect.js
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

const doctorUserId = process.argv[2]; // User ID của bác sĩ

if (!doctorUserId) {
  console.error('Usage: node checkDoctorDashboardDirect.js <doctorUserId>');
  process.exit(1);
}

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  try {
    const doctor = await Doctor.findOne({ user: doctorUserId });
    if (!doctor) {
      console.error('❌ Không tìm thấy Doctor cho userId:', doctorUserId);
      process.exit(1);
    }
    const doctorId = doctor._id;
    console.log('📌 Doctor ID:', doctorId);

    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStartUTC = todayVN.startOf('day').utc().toDate();
    const todayEndUTC = todayVN.endOf('day').utc().toDate();

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: todayStartUTC, $lte: todayEndUTC },
      status: { $ne: 'cancelled' }
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 })
      .lean();

    const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
    const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;

    const schedule = await Schedule.findOne({ doctorId, date: todayVN.format('YYYY-MM-DD') });
    const totalSlots = schedule?.slots.length || 0;
    const bookedSlots = schedule?.slots.filter(s => s.isBooked).length || 0;
    const freeSlots = totalSlots - bookedSlots;
    const bookingRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    // Tuần hiện tại
    const dayOfWeekVN = todayVN.day();
    const mondayVN = todayVN.subtract((dayOfWeekVN + 6) % 7, 'day');
    const sundayVN = mondayVN.add(6, 'day');
    const weekStartUTC = mondayVN.startOf('day').utc().toDate();
    const weekEndUTC = sundayVN.endOf('day').utc().toDate();

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      datetime: { $gte: weekStartUTC, $lte: weekEndUTC },
      status: { $ne: 'cancelled' }
    });

    console.log('📌 Dashboard data:');
    console.log('Today Appointments:');
    todayAppointments.forEach((a, idx) => {
      console.log(`  ${idx + 1}. ${a.date} ${a.time} - Patient: ${a.patient.fullName} (${a.patient.email}) - Status: ${a.status}`);
    });
    console.log('Weekly Appointments Count:', weeklyAppointmentsCount);
    console.log('Pending Count:', pendingCount);
    console.log('Confirmed Count:', confirmedCount);
    console.log('Total Slots:', totalSlots);
    console.log('Booked Slots:', bookedSlots);
    console.log('Free Slots:', freeSlots);
    console.log('Booking Rate:', bookingRate, '%');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

main();
