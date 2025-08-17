require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Appointment = require('../models/Appointment');

if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err.message));

const seedDemoData = async () => {
  try {
    await Appointment.deleteMany({});
    await User.deleteMany({});
    await Specialty.deleteMany({});
    await Location.deleteMany({});

    // --- 1. Locations ---
    const locations = await Location.insertMany([
      { name: 'Cơ sở A' },
      { name: 'Cơ sở B' },
      { name: 'Cơ sở C' },
    ]);

    // --- 2. Specialties ---
    const specialties = await Specialty.insertMany([
      { name: 'Nhi khoa', location: locations[0]._id },
      { name: 'Tim mạch', location: locations[1]._id },
      { name: 'Da liễu', location: locations[2]._id },
      { name: 'Ngoại tổng quát', location: locations[0]._id },
      { name: 'Thần kinh', location: locations[1]._id },
    ]);

    // --- 3. Doctors (10) ---
    const doctorsData = [
      { fullName: 'BS. Nguyễn Văn A', email: 'bacsia@gmail.com', password: '123456' },
      { fullName: 'BS. Trần Thị B', email: 'bacsib@gmail.com', password: '123456' },
      { fullName: 'BS. Lê Văn C', email: 'bacsic@gmail.com', password: '123456' },
      { fullName: 'BS. Phạm Thị D', email: 'bacsid@gmail.com', password: '123456' },
      { fullName: 'BS. Hoàng Văn E', email: 'bacsie@gmail.com', password: '123456' },
      { fullName: 'BS. Vũ Thị F', email: 'bacsif@gmail.com', password: '123456' },
      { fullName: 'BS. Đinh Văn G', email: 'bacsig@gmail.com', password: '123456' },
      { fullName: 'BS. Trương Thị H', email: 'bacsih@gmail.com', password: '123456' },
      { fullName: 'BS. Phan Văn I', email: 'bacsii@gmail.com', password: '123456' },
      { fullName: 'BS. Lý Thị J', email: 'bacsij@gmail.com', password: '123456' },
    ];

    const doctors = [];
    for (const doc of doctorsData) {
      const hashed = await bcrypt.hash(doc.password, 10);

      // Gán ngẫu nhiên 1 location + 1 specialty
      const location = locations[Math.floor(Math.random() * locations.length)];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];

      const d = await User.create({
        fullName: doc.fullName,
        email: doc.email,
        password: hashed,
        role: 'doctor',
        specialty: specialty._id,
        location: location._id,
      });
      doctors.push(d);
    }

    // --- 4. Patients (3) ---
    const patientsData = [
      { fullName: 'Bệnh nhân A', email: 'benhnhana@gmail.com', password: '123456' },
      { fullName: 'Bệnh nhân B', email: 'benhnhanb@gmail.com', password: '123456' },
      { fullName: 'Bệnh nhân C', email: 'benhnhanc@gmail.com', password: '123456' },
    ];

    const patients = [];
    for (const pat of patientsData) {
      const hashed = await bcrypt.hash(pat.password, 10);
      const p = await User.create({
        fullName: pat.fullName,
        email: pat.email,
        password: hashed,
        role: 'patient',
      });
      patients.push(p);
    }

    // --- 5. Appointments mẫu (7) ---
    const now = new Date();
    const appointmentsData = [
      { doctor: doctors[0]._id, patient: patients[0]._id, specialty: doctors[0].specialty, location: doctors[0].location, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0) },
      { doctor: doctors[1]._id, patient: patients[1]._id, specialty: doctors[1].specialty, location: doctors[1].location, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30) },
      { doctor: doctors[2]._id, patient: patients[2]._id, specialty: doctors[2].specialty, location: doctors[2].location, date: new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 11, 0) },
      { doctor: doctors[3]._id, patient: patients[0]._id, specialty: doctors[3].specialty, location: doctors[3].location, date: new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 14, 30) },
      { doctor: doctors[4]._id, patient: patients[1]._id, specialty: doctors[4].specialty, location: doctors[4].location, date: new Date(now.getFullYear(), now.getMonth(), now.getDate()+2, 15, 0) },
      { doctor: doctors[5]._id, patient: patients[2]._id, specialty: doctors[5].specialty, location: doctors[5].location, date: new Date(now.getFullYear(), now.getMonth(), now.getDate()+2, 9, 30) },
      { doctor: doctors[6]._id, patient: patients[0]._id, specialty: doctors[6].specialty, location: doctors[6].location, date: new Date(now.getFullYear(), now.getMonth(), now.getDate()+3, 13, 0) },
    ];

    await Appointment.insertMany(appointmentsData);

    console.log('>>> Seed demo thành công với 5 chuyên khoa + 10 bác sĩ + 3 bệnh nhân + 7 lịch!');
    process.exit(0);

  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
};

seedDemoData();
