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

// Chuyển tiếng Việt có dấu -> không dấu, chữ thường, bỏ khoảng trắng
const normalizeForEmail = (str) => str
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, '')
  .toLowerCase();

const seedData = async () => {
  try {
    // ----------- Xóa dữ liệu cũ -----------
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({})
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

        // Tạo User doctor và truyền specialty + location để hook post-save tạo Doctor thành công
        const user = await User.create({
          fullName: `${spec.name} Doctor at ${loc.name}`,
          email: `${normalizeForEmail(spec.name)}_${normalizeForEmail(loc.name)}@demo.com`,
          password: hashedPassword,
          role: 'doctor',
          specialty: spec._id,
          location: loc._id
        });

        // // Tạo Doctor document thủ công, phòng trường hợp hook post-save không chạy
        // await Doctor.create({
        //   user: user._id,
        //   specialty: spec._id,
        //   location: loc._id
        // });
      }
    }
    console.log('👨‍⚕️ Doctors and Users seeded successfully');

    // ----------- Seed Patients -----------
    const patientsData = [
      { fullName: 'Nguyen Van A', email: 'patient_a@demo.com', password: '123456' },
      { fullName: 'Tran Thi B', email: 'patient_b@demo.com', password: '123456' },
      { fullName: 'Le Van C', email: 'patient_c@demo.com', password: '123456' },
    ];

    for (const p of patientsData) {
      const hashedPassword = await bcrypt.hash(p.password, 10);
      await User.create({
        fullName: p.fullName,
        email: p.email,
        password: hashedPassword,
        role: 'patient'
      });
    }
    console.log(`👨‍👩‍👧 ${patientsData.length} patients seeded successfully`);

    console.log('🎉 Seed data completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
