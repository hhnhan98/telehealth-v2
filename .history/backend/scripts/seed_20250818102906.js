// seedDemoData.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Specialty = require('./models/Specialty');
const Location = require('./models/Location');
const Appointment = require('./models/Appointment');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

async function seedDemoData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Specialty.deleteMany({}),
      Location.deleteMany({}),
      Appointment.deleteMany({})
    ]);
    console.log('🗑️ Cleared old data');

    // Create Locations
    const locations = await Location.insertMany([
      { name: 'Cơ sở 1', address: '123 Đường A' },
      { name: 'Cơ sở 2', address: '456 Đường B' },
      { name: 'Cơ sở 3', address: '789 Đường C' }
    ]);
    console.log('🏥 Seeded Locations');

    // Create Specialties (each linked to one location)
    const specialties = await Specialty.insertMany([
      { name: 'Chuyên khoa 1', location: [locations[0]._id] },
      { name: 'Chuyên khoa 2', location: [locations[1]._id] },
      { name: 'Chuyên khoa 3', location: [locations[2]._id] }
    ]);
    console.log('🩺 Seeded Specialties');

    // Hash password
    const hashPassword = async (pw) => await bcrypt.hash(pw, 10);

    // Create Users for Doctors
    const doctorUsers = await User.insertMany([
      {
        fullName: 'Bác sĩ 1',
        email: 'doctor1@example.com',
        password: await hashPassword('123456'),
        role: 'doctor',
        gender: 'male',
        phone: '0900000001'
      },
      {
        fullName: 'Bác sĩ 2',
        email: 'doctor2@example.com',
        password: await hashPassword('123456'),
        role: 'doctor',
        gender: 'female',
        phone: '0900000002'
      },
      {
        fullName: 'Bác sĩ 3',
        email: 'doctor3@example.com',
        password: await hashPassword('123456'),
        role: 'doctor',
        gender: 'male',
        phone: '0900000003'
      }
    ]);

    // Create Doctors linked to User + Specialty + Location
    const doctors = await Doctor.insertMany([
      {
        user: doctorUsers[0]._id,
        specialty: specialties[0]._id,
        location: locations[0]._id,
        bio: 'Bác sĩ 1 chuyên khoa 1 tại cơ sở 1'
      },
      {
        user: doctorUsers[1]._id,
        specialty: specialties[1]._id,
        location: locations[1]._id,
        bio: 'Bác sĩ 2 chuyên khoa 2 tại cơ sở 2'
      },
      {
        user: doctorUsers[2]._id,
        specialty: specialties[2]._id,
        location: locations[2]._id,
        bio: 'Bác sĩ 3 chuyên khoa 3 tại cơ sở 3'
      }
    ]);
    console.log('👨‍⚕️ Seeded Doctors');

    // Create Users for Patients
    const patientUsers = await User.insertMany([
      {
        fullName: 'Bệnh nhân 1',
        email: 'patient1@example.com',
        password: await hashPassword('123456'),
        role: 'patient',
        gender: 'male',
        phone: '0910000001'
      },
      {
        fullName: 'Bệnh nhân 2',
        email: 'patient2@example.com',
        password: await hashPassword('123456'),
        role: 'patient',
        gender: 'female',
        phone: '0910000002'
      }
    ]);

    // Create Patients linked to User
    const patients = await Patient.insertMany([
      {
        user: patientUsers[0]._id,
        fullName: patientUsers[0].fullName,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        phone: '0910000001',
        address: 'Hà Nội'
      },
      {
        user: patientUsers[1]._id,
        fullName: patientUsers[1].fullName,
        dateOfBirth: new Date('1992-02-02'),
        gender: 'female',
        phone: '0910000002',
        address: 'Hồ Chí Minh'
      }
    ]);
    console.log('👩‍🦰 Seeded Patients');

    // Generate some appointment times in UTC (today + tomorrow)
    const today = new Date();
    today.setUTCHours(8, 0, 0, 0); // 08:00 UTC
    const today1030 = new Date(today.getTime() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000); // 10:30 UTC
    const today1400 = new Date(today.getTime() + 6 * 60 * 60 * 1000); // 14:00 UTC
    const tomorrow9 = new Date(today.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000); // Tomorrow 09:00 UTC
    const tomorrow15 = new Date(today.getTime() + 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000); // Tomorrow 15:00 UTC

    // Create Appointments with statuses
    const appointments = await Appointment.insertMany([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: today,
        status: 'pending',
        reason: 'Khám tổng quát'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        date: today1030,
        status: 'confirmed',
        reason: 'Khám tim mạch'
      },
      {
        patient: patients[0]._id,
        doctor: doctors[2]._id,
        date: today1400,
        status: 'completed',
        reason: 'Khám da liễu'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        date: tomorrow9,
        status: 'pending',
        reason: 'Khám nội tổng quát'
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        date: tomorrow15,
        status: 'confirmed',
        reason: 'Khám ngoại khoa'
      }
    ]);
    console.log('📅 Seeded Appointments');

    console.log('✅ DONE SEED DEMO DATA');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedDemoData();
