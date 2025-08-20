// scripts/seedAndTestBooking.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const ScheduleService = require('../services/schedule.service');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Specialty.deleteMany({}),
    Location.deleteMany({}),
    Schedule.deleteMany({}),
    Appointment.deleteMany({}),
  ]);
  console.log('🗑️ Old data cleared');
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await clearCollections();

    // --- Users ---
    const admin = new User({
      fullName: 'Admin Demo',
      email: 'admin@telehealth.com',
      password: await hashPassword('123456'),
      role: 'admin',
    });
    const patientUser = new User({
      fullName: 'Patient Demo',
      email: 'patient@telehealth.com',
      password: await hashPassword('123456'),
      role: 'patient',
    });
    await admin.save();
    await patientUser.save();

    const patientProfile = new Patient({
      user: patientUser._id,
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Main St',
      medicalHistory: 'Không có tiền sử bệnh',
    });
    await patientProfile.save();

    // --- Locations & Specialties ---
    const loc1 = await new Location({ name: 'Cơ sở 1', address: 'Hà Nội' }).save();
    const loc2 = await new Location({ name: 'Cơ sở 2', address: 'Hồ Chí Minh' }).save();

    const spec1 = await new Specialty({ name: 'Chuyên khoa 1', location: loc1._id }).save();
    const spec2 = await new Specialty({ name: 'Chuyên khoa 2', location: loc2._id }).save();

    // --- Doctors ---
    const doctor1User = new User({
      fullName: 'Doctor One',
      email: 'doctor1@telehealth.com',
      password: await hashPassword('123456'),
      role: 'doctor',
    });
    await doctor1User.save();

    const doctor1 = new Doctor({
      user: doctor1User._id,
      specialty: spec1._id,
      location: loc1._id,
      phone: '0987654321',
      bio: 'Bác sĩ chuyên khoa 1',
    });
    await doctor1.save();

    spec1.doctors.push(doctor1._id);
    await spec1.save();

    // --- Schedules (5 ngày) ---
    const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
    for (let i = 0; i < 5; i++) {
      const date = dayjs().add(i, 'day').format('YYYY-MM-DD');
      await new Schedule({
        doctorId: doctor1._id,
        date,
        slots: timeSlots.map(time => ({ time, isBooked: false })),
      }).save();
    }
    console.log('✅ Schedules generated for 5 days');

    // --- Create demo Appointment ---
    const demoTime = '08:00';
    const demoDate = dayjs().format('YYYY-MM-DD');
    const otp = Math.floor(100000 + Math.random() * 900000);

    const appointment = await Appointment.create({
      location: loc1._id,
      specialty: spec1._id,
      doctor: doctor1._id,
      patient: patientUser._id,
      date: demoDate,
      time: demoTime,
      datetime: dayjs(`${demoDate} ${demoTime}`).toDate(),
      reason: 'Khám định kỳ',
      otp,
      otpExpiresAt: dayjs().add(5, 'minute').toDate(),
      status: 'pending',
      isVerified: false,
    });

    await ScheduleService.bookSlot(doctor1._id, demoDate, demoTime);

    console.log(`✅ Demo appointment created with OTP: ${otp}`);

    console.log('🎉 Seed & test demo data completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
