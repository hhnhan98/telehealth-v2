// scripts/seedDemoData.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err.message));

const seedDemoData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await Specialty.deleteMany({});
    await Location.deleteMany({});

    // --- 1. Tạo cơ sở y tế ---
    const locations = await Location.insertMany([
      { name: 'Cơ sở A' },
      { name: 'Cơ sở B' },
      { name: 'Cơ sở C' },
      { name: 'Cơ sở D' },
      { name: 'Cơ sở E' },
    ]);

    // --- 2. Tạo chuyên khoa ---
    const specialties = await Specialty.insertMany([
      { name: 'Nhi khoa', location: locations[0]._id },
      { name: 'Tim mạch', location: locations[1]._id },
      { name: 'Ngoại tổng quát', location: locations[2]._id },
      { name: 'Da liễu', location: locations[3]._id },
      { name: 'Tai mũi họng', location: locations[4]._id },
    ]);

    // --- 3. Tạo bác sĩ ---
    const doctorPasswords = '123456';
    const hashedPassword = await bcrypt.hash(doctorPasswords, 10);

    const doctorsData = [
      { fullName: 'BS. Nguyễn Văn A', email: 'bacsia@gmail.com', specialty: specialties[0]._id, location: locations[0]._id },
      { fullName: 'BS. Trần Thị B', email: 'bacsib@gmail.com', specialty: specialties[1]._id, location: locations[1]._id },
      { fullName: 'BS. Lê Văn C', email: 'bacsic@gmail.com', specialty: specialties[2]._id, location: locations[2]._id },
      { fullName: 'BS. Phạm Thị D', email: 'bacsid@gmail.com', specialty: specialties[3]._id, location: locations[3]._id },
      { fullName: 'BS. Hoàng Văn E', email: 'bacsie@gmail.com', specialty: specialties[4]._id, location: locations[4]._id },
      { fullName: 'BS. Vũ Thị F', email: 'bacsif@gmail.com', specialty: specialties[0]._id, location: locations[0]._id },
      { fullName: 'BS. Phan Văn G', email: 'bacsig@gmail.com', specialty: specialties[1]._id, location: locations[1]._id },
      { fullName: 'BS. Nguyễn Thị H', email: 'bacsih@gmail.com', specialty: specialties[2]._id, location: locations[2]._id },
      { fullName: 'BS. Lê Thị I', email: 'bacsii@gmail.com', specialty: specialties[3]._id, location: locations[3]._id },
      { fullName: 'BS. Trần Văn J', email: 'bacsij@gmail.com', specialty: specialties[4]._id, location: locations[4]._id },
    ];

    const doctors = [];
    for (const d of doctorsData) {
      const doctor = new Doctor({
        fullName: d.fullName,
        email: d.email,
        password: hashedPassword,
        role: 'doctor',
        specialty: d.specialty,
        location: d.location,
      });
      await doctor.save();
      doctors.push(doctor);
    }

    // --- 4. Tạo bệnh nhân ---
    const patientPasswords = '123456';
    const hashedPatientPassword = await bcrypt.hash(patientPasswords, 10);

    const patientsData = [
      { fullName: 'Bệnh nhân A', email: 'benhnhana@gmail.com' },
      { fullName: 'Bệnh nhân B', email: 'benhnhanb@gmail.com' },
      { fullName: 'Bệnh nhân C', email: 'benhnhanc@gmail.com' },
    ];

    const patients = [];
    for (const p of patientsData) {
      const patient = new User({
        fullName: p.fullName,
        email: p.email,
        password: hashedPatientPassword,
        role: 'patient',
      });
      await patient.save();
      patients.push(patient);
    }

    // --- 5. Tạo lịch hẹn mẫu ---
    const appointmentDates = [
      '2025-08-20', '2025-08-21', '2025-08-22', '2025-08-23', '2025-08-24', '2025-08-25', '2025-08-26'
    ];

    const appointmentTimes = ['08:00','09:00','10:00','13:00','14:00','15:00'];

    const appointments = [];

    for (let i = 0; i < 7; i++) {
      const appointment = new Appointment({
        location: doctors[i%doctors.length].location,
        specialty: doctors[i%doctors.length].specialty,
        doctor: doctors[i%doctors.length]._id,
        date: appointmentDates[i],
        time: appointmentTimes[i%appointmentTimes.length],
        patient: {
          _id: patients[i%patients.length]._id,
          fullName: patients[i%patients.length].fullName,
          email: patients[i%patients.length].email,
        },
        status: 'pending',
      });
      await appointment.save();
      appointments.push(appointment);
    }

    // --- 6. In danh sách đăng nhập demo ---
    console.log('\n=== DANH SÁCH BÁC SĨ DEMO ===');
    doctors.forEach(d => console.log(`${d.fullName} -> ${d.email} / 123456`));

    console.log('\n=== DANH SÁCH BỆNH NHÂN DEMO ===');
    patients.forEach(p => console.log(`${p.fullName} -> ${p.email} / 123456`));

    console.log('\n=== LỊCH HẸN DEMO ===');
    appointments.forEach(a => console.log(`Bác sĩ: ${doctors.find(d=>d._id.equals(a.doctor)).fullName}, Bệnh nhân: ${a.patient.fullName}, ${a.date} ${a.time}`));

    console.log('\n>>> Seed demo dữ liệu thành công!');
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
};

seedDemoData();
