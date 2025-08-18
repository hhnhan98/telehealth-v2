// scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Appointment = require('../models/Appointment');

async function seedDemoData() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear old data
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Patient.deleteMany(),
      Location.deleteMany(),
      Specialty.deleteMany(),
      Appointment.deleteMany(),
    ]);
    console.log('Cleared old data');

    // Seed Locations
    const locations = await Location.insertMany([
      { name: 'Cơ sở 1', address: '123 Đường A' },
      { name: 'Cơ sở 2', address: '456 Đường B' },
      { name: 'Cơ sở 3', address: '789 Đường C' },
    ]);
    console.log('Seeded Locations');

    // Seed Specialties
    const specialties = await Specialty.insertMany([
      { name: 'Chuyên khoa 1', location: [locations[0]._id] },
      { name: 'Chuyên khoa 2', location: [locations[1]._id] },
      { name: 'Chuyên khoa 3', location: [locations[2]._id] },
    ]);
    console.log('Seeded Specialties');

    // Seed Users (Doctors)
    const doctorUsers = await User.insertMany([
      {
        fullName: 'Bác sĩ 1',
        email: 'doctor1@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'doctor',
        phone: '0900000001',
        gender: 'male',
      },
      {
        fullName: 'Bác sĩ 2',
        email: 'doctor2@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'doctor',
        phone: '0900000002',
        gender: 'female',
      },
      {
        fullName: 'Bác sĩ 3',
        email: 'doctor3@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'doctor',
        phone: '0900000003',
        gender: 'male',
      },
    ]);

    // Seed Doctors
    const doctors = await Doctor.insertMany([
      {
        user: doctorUsers[0]._id,
        fullName: doctorUsers[0].fullName,
        specialty: specialties[0]._id,
        location: locations[0]._id,
        experience: 5,
        bio: 'Bác sĩ 1 chuyên khoa 1',
      },
      {
        user: doctorUsers[1]._id,
        fullName: doctorUsers[1].fullName,
        specialty: specialties[1]._id,
        location: locations[1]._id,
        experience: 7,
        bio: 'Bác sĩ 2 chuyên khoa 2',
      },
      {
        user: doctorUsers[2]._id,
        fullName: doctorUsers[2].fullName,
        specialty: specialties[2]._id,
        location: locations[2]._id,
        experience: 10,
        bio: 'Bác sĩ 3 chuyên khoa 3',
      },
    ]);
    console.log('Seeded Doctors');

    // Seed Users (Patients)
    const patientUsers = await User.insertMany([
      {
        fullName: 'Bệnh nhân 1',
        email: 'patient1@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'patient',
        phone: '0910000001',
        gender: 'male',
      },
      {
        fullName: 'Bệnh nhân 2',
        email: 'patient2@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'patient',
        phone: '0910000002',
        gender: 'female',
      },
    ]);

    // Seed Patients
    const patients = await Patient.insertMany([
      {
        user: patientUsers[0]._id,
        fullName: patientUsers[0].fullName,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        phone: '0910000001',
        address: 'Hà Nội',
      },
      {
        user: patientUsers[1]._id,
        fullName: patientUsers[1].fullName,
        dateOfBirth: new Date('1992-02-02'),
        gender: 'female',
        phone: '0910000002',
        address: 'TP HCM',
      },
    ]);
    console.log('Seeded Patients');

    // Seed Appointments (5 appointments, multiple statuses)
    const now = new Date();
    const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

    await Appointment.insertMany([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: todayMorning,
        status: 'pending',
        reason: 'Khám tổng quát',
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0),
        status: 'confirmed',
        reason: 'Khám da liễu',
      },
      {
        patient: patients[0]._id,
        doctor: doctors[2]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0),
        status: 'completed',
        reason: 'Khám tim mạch',
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0),
        status: 'pending',
        reason: 'Khám nội tiết',
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0, 0),
        status: 'confirmed',
        reason: 'Khám tai mũi họng',
      },
    ]);
    console.log('Seeded Appointments');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDemoData();
