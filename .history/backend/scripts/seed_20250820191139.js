// scripts/seedFreshData.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // --- 1. Xóa dữ liệu cũ
    await User.deleteMany({});
    await Specialty.deleteMany({});
    await Location.deleteMany({});
    console.log('🗑️ All old data cleared');

    // --- 2. Tạo Locations
    const locationsData = [
      { name: 'Cơ sở 1', address: 'Hà Nội' },
      { name: 'Cơ sở 2', address: 'Hồ Chí Minh' },
    ];
    const locations = await Location.insertMany(locationsData);
    console.log('✅ Locations seeded');

    // --- 3. Tạo Specialties
    const specialtiesData = [
      { name: 'Chuyên khoa 1', locations: [locations[0]._id, locations[1]._id] },
      { name: 'Chuyên khoa 2', locations: [locations[0]._id] },
      { name: 'Chuyên khoa 3', locations: [locations[1]._id] },
    ];
    const specialties = await Specialty.insertMany(specialtiesData);
    console.log('✅ Specialties seeded');

    // --- 4. Tạo Admin & Patients
    const usersData = [
      { fullName: 'Admin Demo', email: 'admin@demo.com', password: '123456', role: 'admin' },
      { fullName: 'Patient 1', email: 'patient1@demo.com', password: '123456', role: 'patient' },
      { fullName: 'Patient 2', email: 'patient2@demo.com', password: '123456', role: 'patient' },
    ];
    const users = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      users.push(user);
    }
    console.log('✅ Admin & Patients seeded');

    // --- 5. Tạo Doctors & liên kết Specialty + Location
    const doctorsData = [
      {
        fullName: 'Doctor 1',
        email: 'doctor1@demo.com',
        password: '123456',
        role: 'doctor',
        specialty: specialties[0]._id, // Chuyên khoa 1
        location: locations[0]._id,    // Cơ sở 1
      },
      {
        fullName: 'Doctor 2',
        email: 'doctor2@demo.com',
        password: '123456',
        role: 'doctor',
        specialty: specialties[1]._id, // Chuyên khoa 2
        location: locations[0]._id,    // Cơ sở 1
      },
      {
        fullName: 'Doctor 3',
        email: 'doctor3@demo.com',
        password: '123456',
        role: 'doctor',
        specialty: specialties[2]._id, // Chuyên khoa 3
        location: locations[1]._id,    // Cơ sở 2
      },
    ];

    for (const d of doctorsData) {
      const doctor = new User(d);
      await doctor.save();

      // --- Gắn doctor vào specialty
      const spec = await Specialty.findById(d.specialty);
      if (spec) {
        if (!spec.doctors) spec.doctors = [];
        if (!spec.doctors.includes(doctor._id)) spec.doctors.push(doctor._id);
        await spec.save();
      }

      // --- Gắn doctor vào location
      const loc = await Location.findById(d.location);
      if (loc) {
        if (!loc.doctors) loc.doctors = [];
        if (!loc.doctors.includes(doctor._id)) loc.doctors.push(doctor._id);
        await loc.save();
      }
    }
    console.log('✅ Doctors seeded and linked to specialties & locations');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
