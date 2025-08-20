// scripts/e2eTestAuthBackend.js
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // model backend
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://teleadmin:3O21nHsixNkti6yY@cluster0.erwicee.mongodb.net/telehealth';
const API_URL = 'http://localhost:5000/api';

(async () => {
  try {
    console.log('✅ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    const testEmail = 'patient_test@demo.com';
    const testPassword = '123456'; // **plaintext**
    const testName = 'Bệnh nhân Test';

    // --- Xoá user cũ nếu có
    await User.deleteOne({ email: testEmail });
    console.log(`♻️ Old user with email "${testEmail}" removed`);

    // --- Register user bằng API
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      fullName: testName,
      email: testEmail,
      password: testPassword,
      role: 'patient',
    });
    console.log('✅ Register API response:', registerRes.data);

    // --- Kiểm tra user trực tiếp trong DB
    const userFromDB = await User.findOne({ email: testEmail });
    console.log('👀 User from DB:', userFromDB);

    // --- So sánh password hash trực tiếp
    const match = await bcrypt.compare(testPassword, userFromDB.password);
    console.log('🔑 Password match?', match);

    // --- Login bằng API
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: testPassword,
      });
      console.log('✅ Login API response:', loginRes.data);
    } catch (loginErr) {
      console.error('❌ Login API error:', loginErr.response?.data || loginErr.message);
    }

  } catch (err) {
    console.error('🛑 E2E Test error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🛑 MongoDB connection closed');
    process.exit(0);
  }
})();
