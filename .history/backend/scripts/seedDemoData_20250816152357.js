require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Models
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err));

const seedDemoData = async () => {
  try {
    // --- 1. Xóa dữ liệu cũ ---
    await Location.deleteMany({});
    await Specialty.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await Appointment.deleteMany({});

    // --- 2. Tạo locations ---
    const locations = await Location.insertMany([
      { name: 'Cơ sở A' },
      { name: 'Cơ sở B' },
      { name: 'Cơ sở C' },
      { name: 'Cơ sở D' },
      { name: 'Cơ sở E' },
    ]);

    // --- 3. Tạo specialties ---
    const specialties = await Specialty.insertMany([
      { name: 'Nhi khoa', location: locations[0]._id },
      { name: 'Tim mạch', location: locations[1]._id },
      { name: 'Ngoại tổng quát', location: locations[2]._id },
      { name: 'Da liễu', location: locations[3]._id },
      { name: 'Thần kinh', location: locations[4]._id },
    ]);

    // --- 4. Tạo 10 bác sĩ ---
    const doctorsData = [
      { fullName: 'BS. A1', location: locations[0]._id, specialties: [specialties[0]._id] },
      { fullName: 'BS. A2', location: locations[0]._id, specialties: [specialties[1]._id] },
      { fullName: 'BS. B1', location: locations[1]._id, specialties: [specialties[1]._id] },
      { fullName: 'BS. B2', location: locations[1]._id, specialties: [specialties[2]._id] },
      { fullName: 'BS. C1', location: locations[2]._id, specialties: [specialties[2]._id] },
      { fullName: 'BS. C2', location: locations[2]._id, specialties: [specialties[3]._id] },
      { fullName: 'BS. D1', location: locations[3]._id, specialties: [specialties[3]._id] },
      { fullName: 'BS. D2', location: locations[3]._id, specialties: [specialties[4]._id] },
      { fullName: 'BS. E1', location: locations[4]._id, specialties: [specialties[4]._id] },
      { fullName: 'BS. E2', location: locations[4]._id, specialties: [specialties[0]._id] },
    ];

    const doctors = await Doctor.insertMany(doctorsData);

    // --- 5. Tạo 3 bệnh nhân ---
    const passwordHash = await bcrypt.hash('123456', 10);
    const patientsData = [
      { fullName: 'Bệnh nhân A', email: 'benhnhana@gmail.com', password: passwordHash, role: 'patient' },
      { fullName: 'Bệnh nhân B', email: 'benhnhanb@gmail.com', password: passwordHash, role: 'patient' },
      { fullName: 'Bệnh nhân C', email: 'benhnhanc@gmail.com', password: passwordHash, role: 'patient' },
    ];

    const patients = await User.insertMany(patientsData);

    // --- 6. Tạo 5–7 appointment demo ---
    const appointmentsData = [
      {
        location: doctors[0].location,
        specialty: doctors[0].specialties[0],
        doctor: doctors[0]._id,
        date: '2025-08-20',
        time: '09:00',
        patient: { _id: patients[0]._id, fullName: patients[0].fullName, email: patients[0].email },
      },
      {
        location: doctors[1].location,
        specialty: doctors[1].specialties[0],
        doctor: doctors[1]._id,
        date: '2025-08-20',
        time: '10:00',
        patient: { _id: patients[1]._id, fullName: patients[1].fullName, email: patients[1].email },
      },
      {
        location: doctors[2].location,
        specialty: doctors[2].specialties[0],
        doctor: doctors[2]._id,
        date: '2025-08-21',
        time: '09:30',
        patient: { _id: patients[2]._id, fullName: patients[2].fullName, email: patients[2].email },
      },
      {
        location: doctors[3].location,
        specialty: doctors[3].specialties[0],
        doctor: doctors[3]._id,
        date: '2025-08-21',
        time: '11:00',
        patient: { _id: patients[0]._id, fullName: patients[0].fullName, email: patients[0].email },
      },
      {
        location: doctors[4].location,
        specialty: doctors[4].specialties[0],
        doctor: doctors[4]._id,
        date: '2025-08-22',
        time: '14:00',
        patient: { _id: patients[1]._id, fullName: patients[1].fullName, email: patients[1].email },
      },
      {
        location: doctors[5].location,
        specialty: doctors[5].specialties[0],
        doctor: doctors[5]._id,
        date: '2025-08-22',
        time: '15:30',
        patient: { _id: patients[2]._id, fullName: patients[2].fullName, email: patients[2].email },
      },
      {
        location: doctors[6].location,
        specialty: doctors[6].specialties[0],
        doctor: doctors[6]._id,
        date: '2025-08-23',
        time: '08:30',
        patient: { _id: patients[0]._id, fullName: patients[0].fullName, email: patients[0].email },
      },
    ];

    await Appointment.insertMany(appointmentsData);

    console.log('>>> Seed demo thành công');
    process.exit(0);

  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
};

seedDemoData();
