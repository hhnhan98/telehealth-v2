const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const MONGO_URL = process.env.MONGODB_URI; // dùng đúng biến .env của bạn

async function seedDemoData() {
  try {
    if (!MONGO_URL) {
      throw new Error('MONGODB_URI chưa được định nghĩa trong .env');
    }

    // 1. Kết nối DB
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // 2. Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Specialty.deleteMany({}),
      Location.deleteMany({})
    ]);

    // 3. Seed Locations
    const locations = await Location.insertMany([
      { name: 'Hà Nội' },
      { name: 'TP. Hồ Chí Minh' },
      { name: 'Đà Nẵng' }
    ]);
    console.log('✅ Seeded Locations');

    // 4. Seed Specialties
    const specialties = await Specialty.insertMany([
      { name: 'Nội khoa', location: [locations[0]._id, locations[1]._id] },
      { name: 'Ngoại khoa', location: [locations[1]._id, locations[2]._id] },
      { name: 'Nhi khoa', location: [locations[0]._id] }
    ]);
    console.log('✅ Seeded Specialties');

    // 5. Seed Users (Doctors + Patients)
    const hashedPassword = await bcrypt.hash('Start@123', 10);

    const doctors = await User.insertMany([
      {
        fullName: 'Bác sĩ Nguyễn Văn A',
        email: 'doctor1@example.com',
        password: hashedPassword,
        role: 'doctor',
        specialty: specialties[0]._id,
        location: locations[0]._id
      },
      {
        fullName: 'Bác sĩ Trần Thị B',
        email: 'doctor2@example.com',
        password: hashedPassword,
        role: 'doctor',
        specialty: specialties[1]._id,
        location: locations[1]._id
      }
    ]);

    const patients = await User.insertMany([
      {
        fullName: 'Bệnh nhân Lê Văn C',
        email: 'patient1@example.com',
        password: hashedPassword,
        role: 'patient'
      },
      {
        fullName: 'Bệnh nhân Phạm Thị D',
        email: 'patient2@example.com',
        password: hashedPassword,
        role: 'patient'
      }
    ]);

    console.log('✅ Seeded Doctors & Patients');

    // 6. Hoàn tất
    console.log('🎉 Seed dữ liệu demo thành công!');
    mongoose.connection.close();

  } catch (error) {
    console.error('>.< Seed thất bại:', error);
    process.exit(1);
  }
}

seedDemoData();
