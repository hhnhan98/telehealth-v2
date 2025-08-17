// scripts/seedDemoData.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Appointment = require('../models/Appointment');

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telehealth";

const formatDate = d => d.toISOString().split('T')[0];
const formatTime = d => d.toTimeString().split(' ')[0].slice(0, 5);

async function seedDemoData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('>>> Connected to MongoDB');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Location.deleteMany({}),
      Specialty.deleteMany({}),
      Appointment.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash('123456', 10);

    // ===== 1. Tạo User =====
    const doctorUsers = await User.insertMany([
      { fullName: 'Bác sĩ Nguyễn Văn A', email: 'doctor1@demo.com', password: hashedPassword, role: 'doctor' },
      { fullName: 'Bác sĩ Trần Thị B', email: 'doctor2@demo.com', password: hashedPassword, role: 'doctor' },
      { fullName: 'Bác sĩ Lê Văn C', email: 'doctor3@demo.com', password: hashedPassword, role: 'doctor' },
    ]);

    const patientUsers = await User.insertMany([
      { fullName: 'Bệnh nhân Nguyễn Văn 1', email: 'patient1@demo.com', password: hashedPassword, role: 'patient' },
      { fullName: 'Bệnh nhân Trần Thị 2', email: 'patient2@demo.com', password: hashedPassword, role: 'patient' },
      { fullName: 'Bệnh nhân Lê Văn 3', email: 'patient3@demo.com', password: hashedPassword, role: 'patient' },
    ]);

    // ===== 2. Tạo Location =====
    const locations = await Location.insertMany([
      { name: 'Cơ sở Hà Nội', address: '1 Trần Duy Hưng, Hà Nội' },
      { name: 'Cơ sở Hồ Chí Minh', address: '2 Nguyễn Huệ, TP.HCM' },
      { name: 'Cơ sở Đà Nẵng', address: '3 Bạch Đằng, Đà Nẵng' },
    ]);

    // ===== 3. Tạo Specialty =====
    const specialties = await Specialty.insertMany([
      { name: 'Tim mạch' },
      { name: 'Nội tổng quát' },
      { name: 'Nhi khoa' },
    ]);

    // ===== 4. Tạo Doctor =====
    const doctors = await Doctor.insertMany([
      {
        user: doctorUsers[0]._id,
        fullName: doctorUsers[0].fullName,
        specialties: [specialties[0]._id, specialties[1]._id],
        location: locations[0]._id
      },
      {
        user: doctorUsers[1]._id,
        fullName: doctorUsers[1].fullName,
        specialties: [specialties[1]._id, specialties[2]._id],
        location: locations[1]._id
      },
      {
        user: doctorUsers[2]._id,
        fullName: doctorUsers[2].fullName,
        specialties: [specialties[0]._id, specialties[2]._id],
        location: locations[2]._id
      },
    ]);

    // ===== 5. Tạo Appointment =====
    const statuses = ['pending', 'confirmed', 'completed'];
    const appointments = [];

    for (let p of patientUsers) {
      let usedDates = new Set();

      for (let i = 0; i < 5; i++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const specialty = doctor.specialties[Math.floor(Math.random() * doctor.specialties.length)];
        const location = doctor.location;

        const dayOffset = Math.floor(Math.random() * 15) - 7;
        let date = new Date();
        date.setDate(date.getDate() + dayOffset);

        const hours = [8, 9, 10, 13, 14, 15, 16];
        const hour = hours[Math.floor(Math.random() * hours.length)];
        const minute = [0, 30][Math.floor(Math.random() * 2)];
        date.setHours(hour, minute, 0, 0);

        const key = doctor._id.toString() + '_' + date.toISOString();
        if (usedDates.has(key)) continue;
        usedDates.add(key);

        appointments.push({
          location,
          specialty,
          doctor: doctor._id,
          date: formatDate(date),
          time: formatTime(date),
          datetime: date,
          patient: p._id,
          status: statuses[i % statuses.length],
          reason: `Khám thử ${i + 1}`
        });
      }
    }

    await Appointment.insertMany(appointments);

    console.log('>>> Seed demo data thành công!');
    process.exit(0);
  } catch (error) {
    console.error('*** Seed dữ liệu thất bại', error);
    process.exit(1);
  }
}

seedDemoData();
