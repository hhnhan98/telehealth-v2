// scripts/seedAndTest.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // dùng cùng bcryptjs cho seed + test
require('dotenv').config();

const User = require('../models/User');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');

async function seedpw() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // --- Xóa dữ liệu cũ ---
    await User.deleteMany({});
    await Location.deleteMany({});
    await Specialty.deleteMany({});
    console.log('🗑️ Old data cleared');

    // --- Seed Specialties ---
    const specialtiesData = [
      { name: 'Nội tổng quát', description: 'Chuyên khoa Nội tổng quát' },
      { name: 'Ngoại tổng quát', description: 'Chuyên khoa Ngoại tổng quát' },
      { name: 'Nhi khoa', description: 'Chuyên khoa Nhi' },
    ];
    const savedSpecialties = await Specialty.insertMany(specialtiesData);
    console.log('✅ Specialties seeded');

    // --- Seed Locations ---
    const locationsData = [
      { name: 'Bệnh viện A', address: '123 Đường A' },
      { name: 'Phòng khám B', address: '456 Đường B' },
    ];

    const savedLocations = [];
    for (const loc of locationsData) {
      const randomSpecialties = savedSpecialties
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(s => s._id);

      const location = new Location({
        ...loc,
        specialties: randomSpecialties,
      });
      savedLocations.push(await location.save());
    }
    console.log('✅ Locations seeded with specialties');

    // --- Seed Doctors ---
    const doctorsData = [
      { fullName: 'Dr. A', email: 'doca@demo.com', phone: '0901000001' },
      { fullName: 'Dr. B', email: 'docb@demo.com', phone: '0901000002' },
    ];

    for (const doc of doctorsData) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const location = savedLocations[Math.floor(Math.random() * savedLocations.length)];
      const specialtyId = location.specialties[Math.floor(Math.random() * location.specialties.length)];

      const user = new User({
        ...doc,
        password: hashedPassword,
        role: 'doctor',
        location: location._id,
        specialty: specialtyId,
      });
      await user.save();

      // Kiểm tra trực tiếp password
      const checkMatch = await bcrypt.compare('123456', user.password);
      console.log(`Password match for ${user.email}:`, checkMatch);
    }
    console.log('✅ Doctors seeded');

    // --- Seed Patients ---
    const patientsData = [
      { fullName: 'Patient 1', email: 'patient1@demo.com', phone: '0902000001' },
      { fullName: 'Patient 2', email: 'patient2@demo.com', phone: '0902000002' },
    ];

    for (const pat of patientsData) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const user = new User({
        ...pat,
        password: hashedPassword,
        role: 'patient',
      });
      await user.save();

      // Kiểm tra password
      const checkMatch = await bcrypt.compare('123456', user.password);
      console.log(`Password match for ${user.email}:`, checkMatch);
    }
    console.log('✅ Patients seeded');

    mongoose.disconnect();
    console.log('✅ All demo data seeded and passwords verified!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
  }
}

seedpw();
