// scripts/seedDemoData.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err));

const seedDemoData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Promise.all([
      Location.deleteMany({}),
      Specialty.deleteMany({}),
      Doctor.deleteMany({}),
      User.deleteMany({}),
      Appointment.deleteMany({})
    ]);

    // --- Tạo locations ---
    const locations = await Location.insertMany([
      { name: 'Cơ sở A' },
      { name: 'Cơ sở B' },
      { name: 'Cơ sở C' },
    ]);

    // --- Tạo specialties ---
    const specialties = await Specialty.insertMany([
      { name: 'Nhi khoa', location: locations[0]._id },
      { name: 'Tim mạch', location: locations[0]._id },
      { name: 'Ngoại tổng quát', location: locations[1]._id },
      { name: 'Da liễu', location: locations[1]._id },
      { name: 'Thần kinh', location: locations[2]._id },
    ]);

    // --- Tạo bác sĩ ---
    const doctorsData = [
      { fullName: 'Bác sĩ A', email: 'bacsia@gmail.com', specialty: specialties[0]._id, location: locations[0]._id },
      { fullName: 'Bác sĩ B', email: 'bacsib@gmail.com', specialty: specialties[1]._id, location: locations[0]._id },
      { fullName: 'Bác sĩ C', email: 'bacsic@gmail.com', specialty: specialties[2]._id, location: locations[1]._id },
      { fullName: 'Bác sĩ D', email: 'bacsid@gmail.com', specialty: specialties[3]._id, location: locations[1]._id },
      { fullName: 'Bác sĩ E', email: 'bacsie@gmail.com', specialty: specialties[4]._id, location: locations[2]._id },
      { fullName: 'Bác sĩ F', email: 'bacsif@gmail.com', specialty: specialties[0]._id, location: locations[0]._id },
      { fullName: 'Bác sĩ G', email: 'bacsig@gmail.com', specialty: specialties[1]._id, location: locations[0]._id },
      { fullName: 'Bác sĩ H', email: 'bacsih@gmail.com', specialty: specialties[2]._id, location: locations[1]._id },
      { fullName: 'Bác sĩ I', email: 'bacsii@gmail.com', specialty: specialties[3]._id, location: locations[1]._id },
      { fullName: 'Bác sĩ J', email: 'bacsij@gmail.com', specialty: specialties[4]._id, location: locations[2]._id },
    ];

    const hashedPassword = await bcrypt.hash('123456', 10);

    const doctors = [];
    for (const d of doctorsData) {
      const doctor = new Doctor({ ...d, password: hashedPassword, role: 'doctor' });
      await doctor.save();
      doctors.push(doctor);
    }

    // --- Tạo bệnh nhân ---
    const patientsData = [
      { fullName: 'Bệnh nhân A', email: 'benhnhana@gmail.com', password: hashedPassword, role: 'patient' },
      { fullName: 'Bệnh nhân B', email: 'benhnhanb@gmail.com', password: hashedPassword, role: 'patient' },
      { fullName: 'Bệnh nhân C', email: 'benhnhanc@gmail.com', password: hashedPassword, role: 'patient' },
    ];

    const patients = [];
    for (const p of patientsData) {
      const patient = new User(p);
      await patient.save();
      patients.push(patient);
    }

    // --- Tạo appointments mẫu ---
    const appointmentTimes = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'];
    const today = new Date();
    const appointmentDates = [...Array(7)].map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().slice(0,10);
    });

    for (let i = 0; i < 10; i++) {
      const doctor = doctors[i % doctors.length];
      const patient = patients[i % patients.length];

      const appointment = new Appointment({
        location: doctor.location,
        specialty: doctor.specialty,
        doctor: doctor._id,
        date: appointmentDates[i % appointmentDates.length],
        time: appointmentTimes[i % appointmentTimes.length],
        patient: {
          _id: patient._id,
          fullName: patient.fullName,
          email: patient.email
        },
        status: 'pending'
      });

      await appointment.save();
    }

    console.log('>>> Seed demo data thành công');
    process.exit(0);

  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
};

seedDemoData();
