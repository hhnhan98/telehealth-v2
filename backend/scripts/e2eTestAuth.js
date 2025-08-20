/**
 * scripts/e2eTestAuth.js
 * End-to-end test: Register → DB → Login
 */

const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Schema User có pre-save hook

const MONGODB_URI = 'mongodb+srv://teleadmin:3O21nHsixNkti6yY@cluster0.erwicee.mongodb.net/telehealth?retryWrites=true&w=majority';
const API_URL = 'http://localhost:5000/api';

(async () => {
  try {
    console.log('✅ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    const testEmail = 'patient_test@demo.com';
    const testPassword = '123456'; // << plaintext
    const testName = 'Bệnh nhân Test';

    // --- Xoá user cũ nếu có
    await User.deleteOne({ email: testEmail });
    console.log(`♻️ Old user with email "${testEmail}" removed`);

    // --- Payload chuẩn
    const payload = {
      fullName: testName,
      email: testEmail,
      password: testPassword, // plaintext
      role: 'patient',
    };
    console.log('[Payload to register]', payload);

    // --- Register bằng API
    const registerRes = await axios.post(`${API_URL}/auth/register`, payload);
    console.log('✅ Register API response:', registerRes.data);

    // --- Lấy user trực tiếp từ DB
    const userFromDB = await User.findOne({ email: testEmail });
    console.log('👀 User from DB:', {
      _id: userFromDB._id,
      fullName: userFromDB.fullName,
      email: userFromDB.email,
      password: userFromDB.password, // hashed
      role: userFromDB.role,
      createdAt: userFromDB.createdAt,
    });

    // --- So sánh password plaintext vs hash
    const match = await bcrypt.compare(testPassword, userFromDB.password);
    console.log('🔑 Password match (plaintext vs hash)?', match);

    // --- Login bằng API
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, { email: testEmail, password: testPassword });
      console.log('✅ Login API response:', loginRes.data);
    } catch (loginErr) {
      if (loginErr.response?.data) {
        console.log('❌ Login API error:', loginErr.response.data);
      } else {
        console.error('❌ Login error:', loginErr.message);
      }
    }

  } catch (err) {
    console.error('🛑 E2E test error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🛑 MongoDB connection closed');
    process.exit(0);
  }
})();
