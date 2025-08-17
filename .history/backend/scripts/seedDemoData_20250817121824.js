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

// Khung giờ demo
const WORK_HOURS = ['08:00','08:30','09:00','09:30','10:00','10:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];

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

    // ===== 1. Tạo Users =====
    const doctorUsers = await User.insertMany([
      { fullName: 'Bác sĩ 1', email: 'doctor1@demo.com', password: hashedPassword, role: 'doctor' },
      { fullName: 'Bác sĩ 2', email: 'doctor2@demo.com', password: hashedPassword, role: 'doctor' },
      { fullName: 'Bác sĩ 3', email: 'doctor3@demo.com', password: hashedPassword, role: 'doctor' },
    ]);

    const patientUsers = await User.insertMany([
      { fullName: 'Bệnh nhân 1', email: 'patient1@demo.com', password: hashedPassword, role: 'patient' },
      { fullName: 'Bệnh nhân 2', email: 'patient2@demo.com', password: hashedPassword, role: 'patient' },
      { fullName: 'Bệnh nhân 3', email: 'patient3@demo.com', password: hashedPassword, role: 'patient' },
    ]);

    // ===== 2. Tạo Locations =====
    const locations = await Location.insertMany([
      { name: 'Cơ sở 1', address: 'Địa chỉ 1' },
      { name: 'Cơ sở 2', address: 'Địa chỉ 2' },
      { name: 'Cơ sở 3', address: 'Địa chỉ 3' },
    ]);

    // ===== 3. Tạo Specialties =====
    const specialties = await Specialty.insertMany([
      { name: 'Chuyên khoa 1' },
      { name: 'Chuyên khoa 2' },
      { name: 'Chuyên khoa 3' },
    ]);

    // ===== 4. Tạo Doctors =====
    const doctors = await Doctor.insertMany([
      { user: doctorUsers[0]._id, fullName: doctorUsers[0].fullName, specialties: [specialties[0]._id, specialties[1]._id], location: locations[0]._id },
      { user: doctorUsers[1]._id, fullName: doctorUsers[1].fullName, specialties: [specialties[1]._id, specialties[2]._id], location: locations[1]._id },
      { user: doctorUsers[2]._id, fullName: doctorUsers[2].fullName, specialties: [specialties[0]._id, specialties[2]._id], location: locations[2]._id },
    ]);

    // ===== 5. Tạo Appointments demo =====
    const statuses = ['pending', 'confirmed', 'completed'];
    const appointments = [];

    for (let patient of patientUsers) {
      let appointmentCount = 0;
      let usedSlots = {}; // key: doctorId + date -> số slot đã dùng

      while (appointmentCount < 5) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const specialty = doctor.specialties[Math.floor(Math.random() * doctor.specialties.length)];
        const location = doctor.location;

        // Chọn ngày trong 3 ngày tới hoặc trước
        const dayOffset = Math.floor(Math.random() * 7) - 3; // -3 -> +3
        let dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + dayOffset);
        const dateStr = formatDate(dateObj);

        // Đảm bảo mỗi bác sĩ tối đa 3 lịch/ngày
        const key = doctor._id.toString() + '_' + dateStr;
        if (!usedSlots[key]) usedSlots[key] = 0;
        if (usedSlots[key] >= 3) continue;

        // Chọn giờ hợp lý
        const hour = WORK_HOURS[Math.floor(Math.random() * WORK_HOURS.length)];
        const [h, m] = hour.split(':');
        dateObj.setHours(parseInt(h), parseInt(m), 0, 0);

        appointments.push({
          location,
          specialty,
          doctor: doctor._id,
          date: dateStr,
          time: hour,
          datetime: dateObj,
          patient: patient._id,
          status: statuses[appointmentCount % statuses.length],
          reason: `Khám thử ${appointmentCount + 1}`
        });

        usedSlots[key]++;
        appointmentCount++;
      }
    }

    await Appointment.insertMany(appointments);

    console.log('>>> Seed demo data hoàn tất thành công!');
    process.exit(0);

  } catch (err) {
    console.error('*** Seed dữ liệu thất bại', err);
    process.exit(1);
  }
}

seedDemoData();
