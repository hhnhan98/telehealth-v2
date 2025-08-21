// scripts/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // ----------- Xoá dữ liệu cũ -----------
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Location.deleteMany({});
    await Specialty.deleteMany({});
    console.log('🗑️ Old data cleared');

    // ----------- Seed Locations -----------
    const locations = await Location.insertMany([
      { name: 'Bệnh viện A' },
      { name: 'Phòng khám B' },
      { name: 'Trung tâm Y tế C' }
    ]);
    console.log(`🏥 ${locations.length} cơ sở đã seed`);

    // ----------- Seed Specialties -----------
    const specialties = await Specialty.insertMany([
      { name: 'Nhi khoa', locations: locations.map(l => l._id) },
      { name: 'Tim mạch', locations: locations.map(l => l._id) },
      { name: 'Da liễu', locations: locations.map(l => l._id) }
    ]);
    console.log(`🩺 ${specialties.length} chuyên khoa đã seed`);

    // ----------- Seed Doctors & Users -----------
    for (const spec of specialties) {
      for (const loc of locations) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        const user = await User.create({
          fullName: `${spec.name} Doctor at ${loc.name}`,
          email: `${spec.name.toLowerCase()}_${loc.name.replace(/\s+/g, '').toLowerCase()}@demo.com`,
          password: hashedPassword,
          role: 'doctor'
        });

        await Doctor.create({
          user: user._id,
          specialty: spec._id,
          location: loc._id
        });
      }
    }

    console.log('👨‍⚕️ Doctors and Users seeded successfully');
    console.log('🎉 Seed data completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
