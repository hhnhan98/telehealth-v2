const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding...');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Specialty.deleteMany({}),
      Location.deleteMany({}),
      Appointment.deleteMany({})
    ]);

    // Password mặc định
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Tạo 3 cơ sở y tế
    const locations = await Location.insertMany([
      { name: 'Cơ sở 1 - Hà Nội', address: '123 Đường A, Hà Nội' },
      { name: 'Cơ sở 2 - Đà Nẵng', address: '456 Đường B, Đà Nẵng' },
      { name: 'Cơ sở 3 - TP.HCM', address: '789 Đường C, TP.HCM' }
    ]);

    // Mỗi cơ sở 3 chuyên khoa
    const specialtyNames = ['Nội tổng quát', 'Nhi khoa', 'Tim mạch'];
    let specialties = [];

    for (let loc of locations) {
      for (let name of specialtyNames) {
        const sp = await Specialty.create({ name, location: loc._id });
        specialties.push(sp);
      }
    }

    // Tạo bác sĩ (mỗi chuyên khoa 1 bác sĩ)
    let doctors = [];
    for (let i = 0; i < specialties.length; i++) {
      const user = await User.create({
        fullName: `Bác sĩ ${specialties[i].name} ${i + 1}`,
        email: `doctor${i + 1}@example.com`,
        password: hashedPassword,
        role: 'doctor'
      });

      const doctor = await Doctor.create({
        user: user._id,
        specialty: specialties[i]._id,
        location: specialties[i].location,
        bio: `Bác sĩ chuyên khoa ${specialties[i].name} với nhiều năm kinh nghiệm`
      });

      doctors.push(doctor);
    }

    // Tạo bệnh nhân
    let patients = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        fullName: `Bệnh nhân ${i}`,
        email: `patient${i}@example.com`,
        password: hashedPassword,
        role: 'patient'
      });

      const patient = await Patient.create({
        user: user._id,
        dateOfBirth: new Date(1990, i, i + 5),
        gender: i % 2 === 0 ? 'male' : 'female'
      });

      patients.push(patient);
    }

    // Ngày tham chiếu
    const today = new Date('2025-08-18T09:00:00');

    // Tạo lịch hẹn cho bệnh nhân (có đủ pending, confirmed, completed)
    let statuses = ['pending', 'confirmed', 'completed'];
    for (let i = 0; i < patients.length; i++) {
      for (let j = 0; j < statuses.length; j++) {
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + (i - 2)); // trừ/cộng quanh hôm nay
        appointmentDate.setHours(8 + j * 2); // 8h, 10h, 12h

        await Appointment.create({
          patient: patients[i]._id,
          doctor: doctors[(i + j) % doctors.length]._id,
          date: appointmentDate,
          status: statuses[j],
          reason: `Khám ${statuses[j]} - bệnh nhân ${i + 1}`
        });
      }
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
