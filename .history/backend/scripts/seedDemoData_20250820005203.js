// scripts/seedDemoData.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const ScheduleService = require('../services/schedule.service');
const { generateOTP } = require('../utils/booking');

async function seedDemoData() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Thiếu biến môi trường MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // --- Clear old data ---
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Location.deleteMany({}),
      Specialty.deleteMany({}),
      Schedule.deleteMany({}),
      Appointment.deleteMany({})
    ]);
    console.log('🗑️ Old data cleared');

    // --- Users ---
    const admin = await User.create({
      fullName: 'Admin Demo',
      email: 'admin@telehealth.com',
      password: '123456',
      role: 'admin'
    });

    const patientUser = await User.create({
      fullName: 'Patient Demo',
      email: 'patient@telehealth.com',
      password: '123456',
      role: 'patient'
    });

    const doctorUsers = [];
    for (let i = 1; i <= 4; i++) {
      const docUser = await User.create({
        fullName: `Doctor ${i}`,
        email: `doctor${i}@telehealth.com`,
        password: '123456',
        role: 'doctor'
      });
      doctorUsers.push(docUser);
    }
    console.log('✅ Users seeded');

    // --- Patient ---
    await Patient.create({
      user: patientUser._id,
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Main St',
      medicalHistory: 'Không có tiền sử bệnh',
    });
    console.log('✅ Patient seeded');

    // --- Locations ---
    const loc1 = await Location.create({ name: 'Cơ sở 1', address: 'Hà Nội' });
    const loc2 = await Location.create({ name: 'Cơ sở 2', address: 'Hồ Chí Minh' });
    console.log('✅ Locations seeded');

    // --- Specialties ---
    const spec1 = await Specialty.create({ name: 'Chuyên khoa 1', location: loc1._id });
    const spec2 = await Specialty.create({ name: 'Chuyên khoa 2', location: loc1._id });
    const spec3 = await Specialty.create({ name: 'Chuyên khoa 3', location: loc2._id });
    const spec4 = await Specialty.create({ name: 'Chuyên khoa 4', location: loc2._id });
    console.log('✅ Specialties seeded');

    // --- Doctors ---
    const doctors = [];
    doctors.push(await Doctor.create({ user: doctorUsers[0]._id, specialty: spec1._id, location: loc1._id, phone: '0987654321', bio: 'Bác sĩ CK1' }));
    doctors.push(await Doctor.create({ user: doctorUsers[1]._id, specialty: spec2._id, location: loc1._id, phone: '0987654322', bio: 'Bác sĩ CK2' }));
    doctors.push(await Doctor.create({ user: doctorUsers[2]._id, specialty: spec3._id, location: loc2._id, phone: '0987654323', bio: 'Bác sĩ CK3' }));
    doctors.push(await Doctor.create({ user: doctorUsers[3]._id, specialty: spec4._id, location: loc2._id, phone: '0987654324', bio: 'Bác sĩ CK4' }));
    console.log('✅ Doctors seeded');

    // --- Generate Schedules (5 ngày, 08:00-11:00 & 13:00-17:00, 30 phút) ---
    const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
    const today = dayjs();

    for (const doctor of doctors) {
      for (let i = 0; i < 5; i++) {
        const date = today.add(i, 'day').format('YYYY-MM-DD');
        const slots = timeSlots.map(time => ({ time, isBooked: false }));
        await Schedule.create({ doctorId: doctor._id, date, slots });
      }
    }
    console.log('✅ Schedules generated for 5 days');

    // --- Demo Appointment ---
    const demoAppointment = await Appointment.create({
      location: loc1._id,
      specialty: spec1._id,
      doctor: doctors[0]._id,
      patient: patientUser._id,
      date: today.format('YYYY-MM-DD'),
      time: '08:00',
      datetime: today.hour(8).minute(0).toDate(),
      reason: 'Demo booking',
      otp: generateOTP(),
      otpExpiresAt: dayjs().add(5, 'minute').toDate(),
      status: 'pending',
      isVerified: false
    });

    await ScheduleService.bookSlot(doctors[0]._id, demoAppointment.date, demoAppointment.time);
    console.log(`✅ Demo appointment created with OTP: ${demoAppointment.otp}`);

    console.log('🎉 Seed & demo data completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seedDemoData();
