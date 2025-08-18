const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // --- Clear collections ---
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Specialty.deleteMany({});
    await Location.deleteMany({});
    await Appointment.deleteMany({});

    // --- Locations ---
    const locs = await Location.create([
      { name: 'Bệnh viện A' },
      { name: 'Bệnh viện B' },
      { name: 'Bệnh viện C' }
    ]);

    // --- Specialties ---
    const specialties = [];
    for (let i = 0; i < locs.length; i++) {
      for (let j = 1; j <= 3; j++) {
        const spec = await Specialty.create({ name: `Chuyên khoa ${i+1}-${j}` });
        specialties.push({ spec, loc: locs[i] });
      }
    }

    // --- Doctors ---
    const doctors = [];
    for (const sp of specialties) {
      const doc = await Doctor.create({
        fullName: `Dr. ${sp.spec.name}`,
        specialties: [sp.spec._id],
        location: sp.loc._id
      });
      doctors.push(doc);
    }

    // --- Patients ---
    const patients = [];
    for (let i = 1; i <= 8; i++) {
      const pat = await User.create({
        fullName: `Bệnh nhân ${i}`,
        email: `patient${i}@example.com`,
        password: await bcrypt.hash('123456', 10),
        role: 'patient',
        phone: `09000000${i}`,
        dob: `199${i}-01-01`,
        gender: i % 2 === 0 ? 'female' : 'male'
      });
      patients.push(pat);
    }

    // --- Tạo lịch hẹn ---
    const baseDate = new Date('2025-08-18T00:00:00+07:00'); // hôm nay VN
    const statuses = ['pending', 'confirmed', 'completed'];

    const appointments = [];

    // Lịch hẹn bệnh nhân
    for (let i = 0; i < patients.length; i++) {
      const pat = patients[i];
      const doc = doctors[i % doctors.length];

      const apptDate = new Date(baseDate);
      apptDate.setHours(9 + (i % 5) * 2, 0, 0, 0); // giờ 9,11,13,15,17

      appointments.push({
        doctor: doc._id,
        patient: pat._id,
        location: doc.location,
        specialty: doc.specialties[0],
        datetime: apptDate,
        status: statuses[i % statuses.length],
        reason: `Khám ${i+1}`
      });

      // Thêm 1 lịch hôm qua hoặc mai để demo dashboard
      const apptDate2 = new Date(baseDate);
      apptDate2.setDate(baseDate.getDate() + (i % 2 === 0 ? -1 : 1));
      apptDate2.setHours(10 + (i % 5) * 2, 0, 0, 0);

      appointments.push({
        doctor: doc._id,
        patient: pat._id,
        location: doc.location,
        specialty: doc.specialties[0],
        datetime: apptDate2,
        status: statuses[(i+1) % statuses.length],
        reason: `Khám bổ sung ${i+1}`
      });
    }

    await Appointment.insertMany(appointments);

    console.log('✅ Seed dữ liệu hoàn chỉnh cho Dashboard, FE và BE');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
