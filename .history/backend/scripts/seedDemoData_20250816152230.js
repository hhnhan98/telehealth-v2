require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err.message));

const seedDemoData = async () => {
  try {
    // --- Xóa dữ liệu cũ ---
    await Promise.all([
      Location.deleteMany({}),
      Specialty.deleteMany({}),
      Doctor.deleteMany({}),
      User.deleteMany({ role: 'patient' }),
      Appointment.deleteMany({}),
    ]);

    // --- Tạo Locations ---
    const locations = await Location.insertMany([
      { name: 'Cơ sở A' },
      { name: 'Cơ sở B' },
      { name: 'Cơ sở C' },
    ]);

    // --- Tạo Specialties ---
    const specialties = await Specialty.insertMany([
      { name: 'Nhi khoa', location: locations[0]._id },
      { name: 'Tim mạch', location: locations[0]._id },
      { name: 'Ngoại tổng quát', location: locations[1]._id },
      { name: 'Da liễu', location: locations[1]._id },
      { name: 'Răng hàm mặt', location: locations[2]._id },
    ]);

    // --- Tạo Bác sĩ ---
    const doctorsData = [];
    for (let i = 1; i <= 10; i++) {
      const specialty = specialties[i % specialties.length]._id;
      const location = locations[i % locations.length]._id;
      doctorsData.push({
        fullName: `Bác sĩ ${i}`,
        email: `doctor${i}@demo.com`,
        password: await bcrypt.hash('123456', 10),
        role: 'doctor',
        specialty,
        location,
      });
    }
    const doctors = await Doctor.insertMany(doctorsData);

    // --- Tạo Bệnh nhân ---
    const patientsData = [
      { fullName: 'Bệnh nhân A', email: 'patientA@demo.com', password: await bcrypt.hash('123456', 10), role: 'patient' },
      { fullName: 'Bệnh nhân B', email: 'patientB@demo.com', password: await bcrypt.hash('123456', 10), role: 'patient' },
      { fullName: 'Bệnh nhân C', email: 'patientC@demo.com', password: await bcrypt.hash('123456', 10), role: 'patient' },
    ];
    const patients = await User.insertMany(patientsData);

    // --- Tạo Appointments ---
    const appointments = [];
    const slots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];

    for (let i = 0; i < 7; i++) { // 7 ngày
      doctors.forEach((doc, idx) => {
        const patient = patients[idx % patients.length];
        const specialty = doc.specialty;
        const location = doc.location;
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(0,0,0,0);

        const time = slots[Math.floor(Math.random() * slots.length)];

        appointments.push({
          doctor: doc._id,
          patient: patient._id,
          specialty,
          location,
          date,
          time,
          status: 'pending',
        });
      });
    }

    await Appointment.insertMany(appointments);

    console.log('>>> Seed demo dữ liệu thành công');
    process.exit(0);

  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
};

seedDemoData();
