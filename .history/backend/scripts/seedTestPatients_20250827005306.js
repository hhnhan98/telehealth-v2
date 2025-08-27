// scripts/seedTestPatients.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telehealth';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // --- 1. Xóa dữ liệu cũ ---
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    console.log('Dữ liệu cũ đã xóa');

    // --- 2. Lấy specialty & location hiện có ---
    const specialty = await Specialty.findOne() || await Specialty.create({ name: 'Khám tổng quát' });
    const location = await Location.findOne() || await Location.create({ name: 'Bệnh viện demo' });

    // --- 3. Tạo doctor ---
    const doctor = await User.create({
      fullName: 'Dr. Test Seed',
      email: 'doctor1@test.com',
      password: '123456',
      role: 'doctor',
      specialty: specialty._id,
      location: location._id,
    });

    // --- 4. Tạo patient user + patient profile ---
    const patientUser = await User.create({
      fullName: 'Nguyen Van A',
      email: 'patient1@test.com',
      password: '123456',
      role: 'patient',
    });

    const patient = await Patient.create({
      user: patientUser._id,
      address: 'Hanoi',
      bio: 'Bệnh nhân thử nghiệm',
    });

    // --- 5. Tạo appointment completed (datetime ở tương lai) ---
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // ngày mai

    const appointment = await Appointment.create({
      doctor: doctor._id,
      patient: patient._id,
      datetime: tomorrow,
      date: tomorrow,
      time: '10:00',
      status: 'completed',
      specialty: specialty._id,
      location: location._id,
    });

    // --- 6. Tạo MedicalRecord liên quan appointment ---
    await MedicalRecord.create({
      patient: patient._id,
      doctor: doctor._id,
      appointment: appointment._id,
      symptoms: 'Ho, sốt',
      diagnosis: 'Cảm cúm nhẹ',
      height: 170,
      weight: 65,
      bp: '120/80',
      pulse: 75,
      bmi: 22.5,
      prescriptions: [
        { name: 'Paracetamol', dose: '500mg', quantity: 10, note: 'Uống sau ăn' },
      ],
      notes: 'Theo dõi thêm 3 ngày',
      conclusion: 'Tốt',
      careAdvice: 'Nghỉ ngơi, uống nhiều nước',
    });

    console.log('Seed data thành công!');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
