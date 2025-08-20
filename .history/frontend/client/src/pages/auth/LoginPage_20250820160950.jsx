// scripts/testFull.js
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// --- Config
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  fullName: 'Bệnh nhân Test',
  email: 'patient_test@demo.com',
  password: '123456',
  role: 'patient',
};

// --- Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected:', process.env.MONGODB_URI);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const test = async () => {
  await connectDB();

  try {
    // --- Xoá user test nếu có
    await User.deleteOne({ email: TEST_USER.email });
    console.log(`♻️ Old user with email "${TEST_USER.email}" removed`);

    // --- Gửi request Register
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    console.log('✅ Register response:', registerRes.data);

    // --- Lấy user trực tiếp từ DB
    const userFromDB = await User.findOne({ email: TEST_USER.email });
    console.log('👀 User from DB:', userFromDB);

    // --- So sánh password trực tiếp
    const isMatch = await userFromDB.comparePassword(TEST_USER.password);
    console.log('🔑 Password match?', isMatch);

    // --- Gửi request Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    console.log('✅ Login response:', loginRes.data);

  } catch (err) {
    if (err.response) {
      console.error('❌ Axios error response:', err.response.data);
    } else {
      console.error('❌ Error:', err);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed');
  }
};

test();
