// scripts/seedDemoData.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const bcrypt = require('bcrypt');

dayjs.extend(utc);
dayjs.extend(timezone);

require('dotenv').config();
const { MONGODB_URI } = process.env;

// Models
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');

const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear previous data
    await Promise.all([
      Location.deleteMany({}),
      Specialty.deleteMany({}),
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Schedule.deleteMany({}),
      Appointment.deleteMany({})
    ]);
    console.log('🧹 Cleared previous data');

    // --- 1. Locations ---
    const loc1 = await Location.create({ name: 'Bệnh viện A' });
    const loc2 = await Location.create({ name: 'Phòng khám B' });

    // --- 2. Specialties ---
    const spec1 = await Specialty.create({ name: 'Nhi khoa', location: loc1._id });
    const spec2 = await Specialty.create({ name: 'Tim mạch', location: loc1._id });
    const spec3 = await Specialty.create({ name: 'Da liễu', location: loc2._id });

    // --- 3. Users & Doctors ---
    const userDoctor1 = await User.create({
      fullName: 'Nguyễn Văn A',
      email: 'doctorA@test.com',
      password: await bcrypt.hash('123456', 10),
      role: 'doctor'
    });

    const doctor1 = await Doctor.create({
      user: userDoctor1._id,
      fullName: userDoctor1.fullName,
      specialty: spec1._id, // chỉ 1 specialty theo schema mới
      location: loc1._id
    });

    const userDoctor2 = await User.create({
      fullName: 'Trần Thị B',
      email: 'doctorB@test.com',
      password: await bcrypt.hash('123456', 10),
      role: 'doctor'
    });

    const doctor2 = await Doctor.create({
      user: userDoctor2._id,
      fullName: userDoctor2.fullName,
      specialty: spec3._id,
      location: loc2._id
    });

    // --- 4. Users & Patients ---
    const userPatient1 = await User.create({
      fullName: 'Nguyễn Văn X',
      email: 'patient1@test.com',
      password: await bcrypt.hash('123456', 10),
      role: 'patient'
    });

    const patient1 = await Patient.create({
      user: userPatient1._id,
      fullName: userPatient1.fullName,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      phone: '0912345678',
      address: 'Hà Nội'
    });

    const userPatient2 = await User.create({
      fullName: 'Trần Thị Y',
      email: 'patient2@test.com',
      password: await bcrypt.hash('123456', 10),
      role: 'patient'
    });

    const patient2 = await Patient.create({
      user: userPatient2._id,
      fullName: userPatient2.fullName,
      dateOfBirth: new Date('1992-05-15'),
      gender: 'female',
      phone: '0987654321',
      address: 'Hồ Chí Minh'
    });

    // --- 5. Schedule for doctor1 ---
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const slots = WORK_HOURS.map(time => ({ time, isBooked: false }));

    const schedule1 = await Schedule.create({
      doctorId: doctor1._id,
      date: todayVN,
      slots
    });

    // --- 6. Seed Appointment demo ---
    const apptTime = '09:00';
    const apptDateTime = dayjs.tz(`${todayVN} ${apptTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh').toDate();

    const appt1 = await Appointment.create({
      location: loc1._id,
      specialty: spec1._id,
      doctor: doctor1._id,
      patient: patient1._id,
      datetime: apptDateTime,
      date: todayVN,
      time: apptTime,
      reason: 'Khám sức khỏe tổng quát',
      otp: '123456',
      otpExpiresAt: dayjs().add(5, 'minute').toDate(),
      isVerified: false,
      status: 'pending'
    });

    // Update booked slot
    const slotToBook = schedule1.slots.find(s => s.time === apptTime);
    if (slotToBook) slotToBook.isBooked = true;
    await schedule1.save();

    console.log('>>> Seed Data demo thành công');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed error:', err);
    await mongoose.disconnect();
  }
}

seed();
