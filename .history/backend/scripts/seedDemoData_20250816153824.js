const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Appointment = require('../models/Appointment');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

const seedDemoData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('>>> Kết nối MongoDB thành công');

    // --- Xóa dữ liệu cũ ---
    await Appointment.deleteMany({});
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Specialty.deleteMany({});
    await Location.deleteMany({});

    console.log('>>> Đã xóa dữ liệu cũ');

    // --- Tạo Locations ---
    const locations = await Location.insertMany([
      { name: 'Cơ sở A' },
      { name: 'Cơ sở B' },
      { name: 'Cơ sở C' },
    ]);
    console.log('>>> Tạo Locations thành công');

    // --- Tạo Specialties ---
    const specialtiesData = [
      { name: 'Nhi khoa', location: [locations[0]._id, locations[1]._id] },
      { name: 'Tim mạch', location: [locations[1]._id, locations[2]._id] },
      { name: 'Da liễu', location: [locations[0]._id, locations[2]._id] },
      { name: 'Thần kinh', location: [locations[2]._id] },
      { name: 'Cơ xương khớp', location: [locations[0]._id, locations[1]._id, locations[2]._id] },
    ];
    const specialties = await Specialty.insertMany(specialtiesData);
    console.log('>>> Tạo Specialties thành công');

    // --- Tạo Bác sĩ ---
    const doctorPasswords = await Promise.all(
      Array(10).fill(0).map(() => bcrypt.hash('123456', 10))
    );

    const doctorsData = [
      { fullName: 'Bác sĩ A1', specialties: [specialties[0]._id], location: locations[0]._id },
      { fullName: 'Bác sĩ A2', specialties: [specialties[1]._id], location: locations[1]._id },
      { fullName: 'Bác sĩ B1', specialties: [specialties[2]._id], location: locations[2]._id },
      { fullName: 'Bác sĩ B2', specialties: [specialties[3]._id], location: locations[2]._id },
      { fullName: 'Bác sĩ C1', specialties: [specialties[4]._id], location: locations[0]._id },
      { fullName: 'Bác sĩ C2', specialties: [specialties[0]._id], location: locations[1]._id },
      { fullName: 'Bác sĩ D1', specialties: [specialties[1]._id], location: locations[1]._id },
      { fullName: 'Bác sĩ D2', specialties: [specialties[2]._id], location: locations[2]._id },
      { fullName: 'Bác sĩ E1', specialties: [specialties[3]._id], location: locations[0]._id },
      { fullName: 'Bác sĩ E2', specialties: [specialties[4]._id], location: locations[2]._id },
    ];

    const doctorUsersData = doctorsData.map((d, i) => ({
      fullName: d.fullName,
      email: `doctor${i+1}@demo.com`,
      password: doctorPasswords[i],
      role: 'doctor',
      specialty: d.specialties[0], // user schema yêu cầu
    }));

    const doctorUsers = await User.insertMany(doctorUsersData);
    const doctors = await Doctor.insertMany(doctorsData);
    console.log('>>> Tạo 10 bác sĩ thành công (User + Doctor)');

    // --- Tạo Bệnh nhân ---
    const patientPasswords = await Promise.all(
      Array(3).fill(0).map(() => bcrypt.hash('123456', 10))
    );

    const patientsData = [
      { fullName: 'Bệnh nhân 1', email: 'patient1@demo.com', password: patientPasswords[0], role: 'patient' },
      { fullName: 'Bệnh nhân 2', email: 'patient2@demo.com', password: patientPasswords[1], role: 'patient' },
      { fullName: 'Bệnh nhân 3', email: 'patient3@demo.com', password: patientPasswords[2], role: 'patient' },
    ];

    const patients = await User.insertMany(patientsData);
    console.log('>>> Tạo 3 bệnh nhân thành công');

    // --- Tạo Appointments ---
    const appointments = [];

    const sampleTimes = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'];
    const sampleDates = [
      new Date().toISOString().slice(0,10),
      new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,10)
    ];

    doctors.forEach((doc, i) => {
      for (let j = 0; j < 5; j++) {
        const patient = patients[j % patients.length];
        const specialtyId = doc.specialties[0];
        const locationId = doc.location;

        appointments.push({
          doctor: doc._id,
          patient: { _id: patient._id, fullName: patient.fullName, email: patient.email },
          specialty: specialtyId,
          location: locationId,
          date: sampleDates[j % sampleDates.length],
          time: sampleTimes[j % sampleTimes.length],
          status: 'pending',
        });
      }
    });

    await Appointment.insertMany(appointments);
    console.log('>>> Tạo Appointments demo thành công');

    console.log('Seed demo dữ liệu hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
};

seedDemoData();
