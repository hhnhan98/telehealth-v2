// scripts/seedTestDoctor.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Doctor = require('../models/Doctor');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Xóa user + doctor test nếu có
    await Doctor.deleteMany({}).exec();
    await User.deleteMany({ email: 'doctor_test@demo.com' }).exec();

    // Tạo user
    const user = await User.create({
      fullName: 'Bác sĩ Test',
      email: 'doctor_test@demo.com',
      password: '123456', // sẽ hash tự động
      role: 'doctor',
      phone: '0123456789',
    });

    // Tạo doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      specialty: null, // hoặc ID của specialty đã seed
      location: null,  // hoặc ID của location đã seed
      bio: 'Bio ban đầu',
    });

    console.log('✅ Seed test doctor thành công:', {
      userId: user._id,
      doctorId: doctor._id,
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
