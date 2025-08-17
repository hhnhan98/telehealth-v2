// backend/scripts/seedDemoData.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telehealth';

// danh sách chuyên khoa mẫu
const specialtiesData = [
  { name: 'Nội tổng quát' },
  { name: 'Nhi khoa' },
  { name: 'Tai mũi họng' },
];

const statuses = ['pending', 'confirmed', 'completed'];

function randomStatus() {
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function randomDateTime(offsetDays = 0) {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + offsetDays);

  const hours = [8, 9, 10, 13, 14, 15, 16];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = Math.random() < 0.5 ? "00" : "30";

  const dateStr = baseDate.toISOString().split('T')[0]; // yyyy-mm-dd
  const timeStr = `${hour.toString().padStart(2, "0")}:${minute}`;
  const datetime = new Date(`${dateStr}T${timeStr}:00.000Z`);

  return { dateStr, timeStr, datetime };
}

async function seedDemoData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('>>> Kết nối MongoDB thành công');

    // clear dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Specialty.deleteMany({}),
      Location.deleteMany({}),
      Appointment.deleteMany({}),
    ]);

    // tạo cơ sở
    const locations = await Location.insertMany([
      { name: 'Cơ sở 1', address: 'Hà Nội' },
      { name: 'Cơ sở 2', address: 'Hồ Chí Minh' },
      { name: 'Cơ sở 3', address: 'Đà Nẵng' },
    ]);

    // tạo chuyên khoa (chung cho tất cả cơ sở)
    const specialties = await Specialty.insertMany(specialtiesData);

    // tạo bác sĩ
    const doctorUsers = [];
    for (let i = 1; i <= 3; i++) {
      const hashed = await bcrypt.hash('123456', 10);
      const user = await User.create({
        name: `Bác sĩ ${i}`,
        email: `doctor${i}@mail.com`,
        password: hashed,
        role: 'doctor',
      });
      doctorUsers.push(user);
    }

    const doctors = [];
    for (let i = 0; i < doctorUsers.length; i++) {
      const doctor = await Doctor.create({
        user: doctorUsers[i]._id,
        specialty: specialties[i % specialties.length]._id,
        location: locations[i % locations.length]._id,
        bio: `Bác sĩ chuyên khoa ${i + 1}`,
      });
      doctors.push(doctor);
    }

    // tạo bệnh nhân
    const patients = [];
    for (let i = 1; i <= 3; i++) {
      const hashed = await bcrypt.hash('123456', 10);
      const patient = await User.create({
        name: `Bệnh nhân ${i}`,
        email: `patient${i}@mail.com`,
        password: hashed,
        role: 'patient',
      });
      patients.push(patient);
    }

    // tạo lịch hẹn
    const appointments = [];
    for (const patient of patients) {
      for (let j = 0; j < 5; j++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const location = locations.find(l => l._id.equals(doctor.location));
        const specialty = specialties.find(s => s._id.equals(doctor.specialty));

        // random trong khoảng -7 đến +7 ngày
        const offset = Math.floor(Math.random() * 15) - 7;
        const { dateStr, timeStr, datetime } = randomDateTime(offset);

        appointments.push({
          location: location._id,
          specialty: specialty._id,
          doctor: doctor._id,
          patient: patient._id,
          date: dateStr,
          time: timeStr,
          datetime,
          status: randomStatus(),
        });
      }
    }

    await Appointment.insertMany(appointments);

    console.log('>>> Seed dữ liệu thành công 🎉');
    process.exit(0);
  } catch (err) {
    console.error('*** Seed dữ liệu thất bại ***', err);
    process.exit(1);
  }
}

seedDemoData();
