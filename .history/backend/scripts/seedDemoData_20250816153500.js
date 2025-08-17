// scripts/seedDemoData.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const MONGODB_URI = process.env.MONGO_URI;

async function seedDemoData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('>>> Kết nối MongoDB thành công');

    // --- Clear old data ---
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Specialty.deleteMany({});
    await Location.deleteMany({});

    // --- Tạo chuyên khoa ---
    const specialtiesData = ['Nhi khoa', 'Tim mạch', 'Da liễu', 'Thần kinh', 'Tai mũi họng'];
    const specialties = [];
    for (let name of specialtiesData) {
      const spec = new Specialty({ name });
      await spec.save();
      specialties.push(spec);
    }

    // --- Tạo cơ sở y tế ---
    const locationsData = ['Cơ sở A', 'Cơ sở B', 'Cơ sở C'];
    const locations = [];
    for (let name of locationsData) {
      const loc = new Location({ name });
      await loc.save();
      locations.push(loc);
    }

    // --- Tạo bác sĩ ---
    const doctorData = [
      { fullName: 'Bác sĩ A', email: 'bacsia@gmail.com', specialtyIndex: 0, locationIndex: 0 },
      { fullName: 'Bác sĩ B', email: 'bacsib@gmail.com', specialtyIndex: 1, locationIndex: 1 },
      { fullName: 'Bác sĩ C', email: 'bacsic@gmail.com', specialtyIndex: 2, locationIndex: 2 },
      { fullName: 'Bác sĩ D', email: 'bacsid@gmail.com', specialtyIndex: 3, locationIndex: 0 },
      { fullName: 'Bác sĩ E', email: 'bacsie@gmail.com', specialtyIndex: 4, locationIndex: 1 },
      { fullName: 'Bác sĩ F', email: 'bacsif@gmail.com', specialtyIndex: 0, locationIndex: 2 },
      { fullName: 'Bác sĩ G', email: 'bacsig@gmail.com', specialtyIndex: 1, locationIndex: 0 },
      { fullName: 'Bác sĩ H', email: 'bacsih@gmail.com', specialtyIndex: 2, locationIndex: 1 },
      { fullName: 'Bác sĩ I', email: 'bacsii@gmail.com', specialtyIndex: 3, locationIndex: 2 },
      { fullName: 'Bác sĩ J', email: 'bacsij@gmail.com', specialtyIndex: 4, locationIndex: 0 },
    ];

    const doctors = [];
    for (let d of doctorData) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const doc = new User({
        fullName: d.fullName,
        email: d.email,
        password: hashedPassword,
        role: 'doctor',
        specialty: specialties[d.specialtyIndex]._id,
        location: locations[d.locationIndex]._id,
      });
      await doc.save();
      doctors.push(doc);
    }

    // --- Tạo bệnh nhân ---
    const patientData = [
      { fullName: 'Bệnh nhân A', email: 'benhnhana@gmail.com' },
      { fullName: 'Bệnh nhân B', email: 'benhnhanb@gmail.com' },
      { fullName: 'Bệnh nhân C', email: 'benhnhanc@gmail.com' },
      { fullName: 'Bệnh nhân D', email: 'benhnhand@gmail.com' },
      { fullName: 'Bệnh nhân E', email: 'benhnhane@gmail.com' },
    ];

    const patients = [];
    for (let p of patientData) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const patient = new User({
        fullName: p.fullName,
        email: p.email,
        password: hashedPassword,
        role: 'patient',
      });
      await patient.save();
      patients.push(patient);
    }

    // --- Tạo lịch hẹn mẫu ---
    const appointmentDates = [
      '2025-08-17', '2025-08-18', '2025-08-19', '2025-08-20', '2025-08-21'
    ];
    const appointmentTimes = ['08:00', '09:00', '10:00', '14:00', '15:00'];

    const appointments = [];
    for (let i = 0; i < 7; i++) {
      const doctor = doctors[i % doctors.length];
      const patient = patients[i % patients.length];
      const appointment = new Appointment({
        doctor: doctor._id,
        specialty: doctor.specialty,
        location: doctor.location,
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
      appointments.push(appointment);
    }

    console.log('>>> Seed demo data thành công!');
    mongoose.connection.close();
  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    mongoose.connection.close();
  }
}

seedDemoData();
