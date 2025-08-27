// scripts/checkDoctorDashboard.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
require('dotenv').config();

const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');

dayjs.extend(utc);
dayjs.extend(timezone);

const doctorId = process.argv[2]; // lấy từ command line: node checkDoctorDashboard.js <doctorId>

if (!doctorId) {
  console.error('Vui lòng truyền doctorId: node checkDoctorDashboard.js <doctorId>');
  process.exit(1);
}

const checkDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStartUTC = todayVN.startOf('day').utc().toDate();
    const todayEndUTC = todayVN.endOf('day').utc().toDate();

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: todayStartUTC, $lte: todayEndUTC },
      status: { $ne: 'cancelled' }
    }).lean();

    const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
    const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;

    const schedule = await Schedule.findOne({ doctorId, date: todayVN.format('YYYY-MM-DD') });
    let totalSlots = 0;
    let bookedSlots = 0;
    if (schedule) {
      totalSlots = schedule.slots.length;
      bookedSlots = schedule.slots.filter(s => s.isBooked).length;
    }
    const freeSlots = totalSlots - bookedSlots;
    const bookingRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    // --- Tuần hiện tại ---
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

    console.log('--- Dashboard Check ---');
    console.log('Today Appointments:', todayAppointments.length);
    console.log('Pending:', pendingCount);
    console.log('Confirmed:', confirmedCount);
    console.log('Total Slots:', totalSlots);
    console.log('Booked Slots:', bookedSlots);
    console.log('Free Slots:', freeSlots);
    console.log('Booking Rate (%):', bookingRate);
    console.log('Weekly Appointments:', weeklyAppointmentsCount);

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    console.error('❌ Lỗi:', err);
    await mongoose.disconnect();
  }
};

checkDashboard();
