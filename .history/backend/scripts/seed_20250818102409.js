const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

const seedDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('>>> MongoDB connected for seeding demo data...');

    // Xóa toàn bộ dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Specialty.deleteMany({}),
      Location.deleteMany({}),
      Appointment.deleteMany({}),
    ]);
    console.log('>>> Đã xóa dữ liệu cũ.');

    // ====== Locations ======
    const locations = await Location.insertMany([
      { name: 'Cơ sở 1' },
      { name: 'Cơ sở 2' },
      { name: 'Cơ sở 3' },
    ]);
    console.log('>>> Seed locations xong.');

    // ====== Specialties ======
    const specialties = await Specialty.insertMany([
      { name: 'Chuyên khoa 1' },
      { name: 'Chuyên khoa 2' },
      { name: 'Chuyên khoa 3' },
    ]);
    console.log('>>> Seed specialties xong.');

    // ====== Users ======
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Doctors
    const doctorUsers = await User.insertMany([
      {
        fullName: 'Bác sĩ 1',
        email: 'doctor1@example.com',
        password: hashedPassword,
        role: 'doctor',
      },
      {
        fullName: 'Bác sĩ 2',
        email: 'doctor2@example.com',
        password: hashedPassword,
        role: 'doctor',
      },
      {
        fullName: 'Bác sĩ 3',
        email: 'doctor3@example.com',
        password: hashedPassword,
        role: 'doctor',
      },
    ]);

    // Patients
    const patientUsers = await User.insertMany([
      {
        fullName: 'Bệnh nhân A',
        email: 'patientA@example.com',
        password: hashedPassword,
        role: 'patient',
      },
      {
        fullName: 'Bệnh nhân B',
        email: 'patientB@example.com',
        password: hashedPassword,
        role: 'patient',
      },
      {
        fullName: 'Bệnh nhân C',
        email: 'patientC@example.com',
        password: hashedPassword,
        role: 'patient',
      },
    ]);
    console.log('>>> Seed users xong.');

    // ====== Doctors Profile ======
    const doctors = await Doctor.insertMany([
      {
        user: doctorUsers[0]._id,
        fullName: doctorUsers[0].fullName,
        specialty: specialties[0]._id,
        location: locations[0]._id,
        phone: '0901111111',
        bio: 'Bác sĩ chuyên khoa 1.',
      },
      {
        user: doctorUsers[1]._id,
        fullName: doctorUsers[1].fullName,
        specialty: specialties[1]._id,
        location: locations[1]._id,
        phone: '0902222222',
        bio: 'Bác sĩ chuyên khoa 2.',
      },
      {
        user: doctorUsers[2]._id,
        fullName: doctorUsers[2].fullName,
        specialty: specialties[2]._id,
        location: locations[2]._id,
        phone: '0903333333',
        bio: 'Bác sĩ chuyên khoa 3.',
      },
    ]);
    console.log('>>> Seed doctors profile xong.');

    // ====== Appointments (5 lịch hẹn) ======
    const now = new Date();

    const appointments = await Appointment.insertMany([
      // Hôm nay - pending
      {
        doctor: doctors[0]._id,
        patient: patientUsers[0]._id,
        date: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 30)), // 8:30 sáng UTC hôm nay
        status: 'pending',
        reason: 'Khám tổng quát định kỳ',
      },
      // Hôm nay - confirmed
      {
        doctor: doctors[0]._id,
        patient: patientUsers[1]._id,
        date: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 0)), // 10:00 sáng UTC hôm nay
        status: 'confirmed',
        reason: 'Khám tim mạch',
      },
      // Ngày mai - pending
      {
        doctor: doctors[1]._id,
        patient: patientUsers[2]._id,
        date: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 9, 0)), // ngày mai 9:00 UTC
        status: 'pending',
        reason: 'Khám nhi khoa',
      },
      // Hôm qua - completed
      {
        doctor: doctors[2]._id,
        patient: patientUsers[0]._id,
        date: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 14, 0)), // hôm qua 14:00 UTC
        status: 'completed',
        reason: 'Khám chuyên khoa 3',
      },
      // Tuần sau - confirmed
      {
        doctor: doctors[1]._id,
        patient: patientUsers[1]._id,
        date: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7, 15, 30)), // tuần sau 15:30 UTC
        status: 'confirmed',
        reason: 'Khám chuyên khoa 2',
      },
    ]);
    console.log('>>> Seed appointments xong.');

    console.log('>>> Seed demo data thành công ✅');
    process.exit(0);
  } catch (error) {
    console.error('>>> Seeding error:', error);
    process.exit(1);
  }
};

seedDemoData();
