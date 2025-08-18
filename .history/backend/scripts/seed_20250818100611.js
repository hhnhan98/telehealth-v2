const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected for seeding...');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Specialty.deleteMany(),
      Location.deleteMany(),
      Appointment.deleteMany(),
    ]);

    const passwordHash = await bcrypt.hash('123456', 10);

    // --- 1. Seed Locations ---
    const locations = await Location.insertMany([
      { name: 'Cơ sở Hà Nội' },
      { name: 'Cơ sở TP.HCM' },
      { name: 'Cơ sở Đà Nẵng' },
    ]);

    // --- 2. Seed Specialties ---
    const specialtiesData = [
      { name: 'Tim mạch' },
      { name: 'Da liễu' },
      { name: 'Nhi khoa' },
    ];

    const specialties = [];
    for (let loc of locations) {
      for (let spec of specialtiesData) {
        const s = await Specialty.create({ name: `${spec.name} - ${loc.name}` });
        specialties.push({ specialty: s, location: loc });
      }
    }

    // --- 3. Seed Doctors + Users ---
    const doctors = [];
    for (let i = 0; i < specialties.length; i++) {
      const doctorUser = await User.create({
        name: `Bác sĩ ${i + 1}`,
        email: `doctor${i + 1}@example.com`,
        password: passwordHash,
        role: 'doctor',
      });

      const doctor = await Doctor.create({
        user: doctorUser._id,
        specialty: specialties[i].specialty._id,
        location: specialties[i].location._id,
        yearsOfExperience: 5 + i,
        bio: `Bác sĩ chuyên khoa ${specialties[i].specialty.name} với ${5 + i} năm kinh nghiệm.`,
      });

      doctors.push({ doctor, user: doctorUser });
    }

    // --- 4. Seed Patients ---
    const patients = [];
    for (let i = 0; i < 6; i++) {
      const patientUser = await User.create({
        name: `Bệnh nhân ${i + 1}`,
        email: `patient${i + 1}@example.com`,
        password: passwordHash,
        role: 'patient',
      });
      patients.push(patientUser);
    }

    // --- 5. Seed Appointments ---
    const today = new Date('2025-08-18T00:00:00'); // ngày chuẩn cho demo
    const statuses = ['scheduled', 'completed', 'missed']; // không có cancelled

    const appointments = [];

    for (let d of doctors) {
      for (let i = 0; i < 3; i++) {
        const patient = patients[(i + d.doctor._id.getTimestamp().getDate()) % patients.length];
        const date = new Date(today);
        date.setDate(today.getDate() - 1 + i); // hôm qua, hôm nay, ngày mai
        const time = i === 0 ? '09:00' : i === 1 ? '10:30' : '14:00';

        const appt = await Appointment.create({
          patient: patient._id,
          doctor: d.doctor._id,
          date,
          time,
          status: statuses[i % statuses.length],
        });

        appointments.push(appt);
      }
    }

    console.log(`✅ Seeded: ${locations.length} locations, ${specialties.length} specialties, ${doctors.length} doctors, ${patients.length} patients, ${appointments.length} appointments.`);
    await mongoose.disconnect();
    console.log('🌱 Database seeding completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
