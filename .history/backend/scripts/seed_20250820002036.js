// scripts/seed.js
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

async function seed() {
  try {
    // --- Connect MongoDB ---
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
      Appointment.deleteMany({}),
    ]);
    console.log('🗑️ Old data cleared');

    // --- Users ---
    const admin = await new User({ fullName: 'Admin Demo', email: 'admin@telehealth.com', password: '123456', role: 'admin' }).save();
    const patientUser = await new User({ fullName: 'Patient Demo', email: 'patient@telehealth.com', password: '123456', role: 'patient' }).save();

    const doctorUsers = [];
    for (let i = 1; i <= 4; i++) {
      const u = await new User({
        fullName: `Doctor ${i}`,
        email: `doctor${i}@telehealth.com`,
        password: '123456',
        role: 'doctor',
      }).save();
      doctorUsers.push(u);
    }
    console.log('✅ Users seeded');

    // --- Patient ---
    const patient = await new Patient({
      user: patientUser._id,
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Main St',
      medicalHistory: 'Không có tiền sử bệnh',
    }).save();
    console.log('✅ Patient seeded');

    // --- Locations ---
    const loc1 = await new Location({ name: 'Cơ sở 1', address: 'Hà Nội' }).save();
    const loc2 = await new Location({ name: 'Cơ sở 2', address: 'Hồ Chí Minh' }).save();
    console.log('✅ Locations seeded:', loc1._id, loc2._id);

    // --- Specialties ---
    const specialtiesData = [
      { name: 'Chuyên khoa 1', location: loc1._id },
      { name: 'Chuyên khoa 2', location: loc1._id },
      { name: 'Chuyên khoa 3', location: loc2._id },
      { name: 'Chuyên khoa 4', location: loc2._id },
    ];

    const specialties = [];
    for (const sp of specialtiesData) {
      const s = await new Specialty(sp).save();
      specialties.push(s);
      console.log(`- Specialty seeded: ${s.name} | Location: ${sp.location}`);
    }

    // --- Doctors ---
    const doctorsData = [
      { user: doctorUsers[0]._id, specialty: specialties[0]._id, location: loc1._id, phone: '0987654321', bio: 'Bác sĩ CK1' },
      { user: doctorUsers[1]._id, specialty: specialties[1]._id, location: loc1._id, phone: '0987654322', bio: 'Bác sĩ CK2' },
      { user: doctorUsers[2]._id, specialty: specialties[2]._id, location: loc2._id, phone: '0987654323', bio: 'Bác sĩ CK3' },
      { user: doctorUsers[3]._id, specialty: specialties[3]._id, location: loc2._id, phone: '0987654324', bio: 'Bác sĩ CK4' },
    ];

    const doctors = [];
    for (const data of doctorsData) {
      const doc = await new Doctor(data).save();
      doctors.push(doc);
      const user = await User.findById(doc.user);
      const specialty = await Specialty.findById(doc.specialty);
      const location = await Location.findById(doc.location);
      console.log(`- Doctor seeded: ${user.fullName} | Specialty: ${specialty.name} | Location: ${location.name} | Doctor ID: ${doc._id}`);
    }

    // --- Update specialties with doctor IDs ---
    for (let i = 0; i < specialties.length; i++) {
      specialties[i].doctors.push(doctors[i]._id);
      await specialties[i].save();
    }

    // --- Generate Schedules (5 ngày, 8:00–11:00 & 13:00–17:00, 30 phút) ---
    const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
    const today = dayjs();

    for (const doctor of doctors) {
      for (let i = 0; i < 5; i++) {
        const date = today.add(i, 'day').format('YYYY-MM-DD');
        const slots = timeSlots.map(time => ({ time, isBooked: false }));
        const schedule = new Schedule({ doctorId: doctor._id, date, slots });
        await schedule.save();
      }
    }
    console.log('✅ Schedules generated for 5 days');

    // --- Demo Appointment ---
    const demoAppointment = await Appointment.create({
      location: loc1._id,
      specialty: specialties[0]._id,
      doctor: doctors[0]._id,
      patient: patientUser._id,
      date: today.format('YYYY-MM-DD'),
      time: '08:00',
      datetime: today.hour(8).minute(0).toDate(),
      reason: 'Demo booking',
      otp: generateOTP(),
      otpExpiresAt: dayjs().add(5, 'minute').toDate(),
      status: 'pending',
      isVerified: false,
    });
    await ScheduleService.bookSlot(doctors[0]._id, demoAppointment.date, demoAppointment.time);
    console.log(`✅ Demo appointment created with OTP: ${demoAppointment.otp}`);

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
