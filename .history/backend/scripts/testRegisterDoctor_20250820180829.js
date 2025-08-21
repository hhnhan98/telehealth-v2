// scripts/testRegisterDoctor.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telehealth';

async function testRegisterDoctor() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // --- Chọn Specialty & Location sẵn có
    const specialty = await Specialty.findOne();
    const location = await Location.findOne();

    if (!specialty || !location) {
      console.error('⚠️ Cần có ít nhất 1 specialty và 1 location trong DB');
      return process.exit(1);
    }

    // --- Tạo user doctor
    const newDoctor = new User({
      fullName: 'Test Doctor',
      email: `doctor${Date.now()}@demo.com`,
      password: '123456',
      role: 'doctor',
      specialty: specialty._id,
      location: location._id,
    });

    await newDoctor.save();
    console.log('✅ User doctor created:', newDoctor._id);

    // --- Gắn vào Specialty & Location
    if (!specialty.doctors.includes(newDoctor._id)) {
      specialty.doctors.push(newDoctor._id);
      await specialty.save();
    }

    if (!location.doctors.includes(newDoctor._id)) {
      location.doctors.push(newDoctor._id);
      await location.save();
    }

    console.log('✅ Specialty updated:', specialty.doctors);
    console.log('✅ Location updated:', location.doctors);

    // --- Kiểm tra liên kết
    const fetchedDoctor = await User.findById(newDoctor._id)
      .populate('specialty')
      .populate('location');

    console.log('🔍 Fetched doctor with populated fields:');
    console.log({
      id: fetchedDoctor._id,
      fullName: fetchedDoctor.fullName,
      specialty: fetchedDoctor.specialty?.name,
      location: fetchedDoctor.location?.name,
    });

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testRegisterDoctor();
