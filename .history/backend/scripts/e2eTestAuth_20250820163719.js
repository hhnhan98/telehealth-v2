/**
 * Test script end-to-end: Register → DB → Login
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const authService = require('');
const User = require('../models/User');

const MONGODB_URI = 'mongodb+srv://teleadmin:3O21nHsixNkti6yY@cluster0.erwicee.mongodb.net/telehealth?retryWrites=true&w=majority';

(async () => {
  try {
    console.log('✅ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    const testEmail = 'patient_e2e@demo.com';
    const testPassword = '123456'; // plaintext
    const testName = 'Patient E2E';

    // --- Xoá user cũ nếu có
    await User.deleteOne({ email: testEmail });
    console.log(`♻️ Old user with email "${testEmail}" removed`);

    // --- Register user
    const registerRes = await authService.register({
      fullName: testName,
      email: testEmail,
      password: testPassword,
      role: 'patient',
    });
    console.log('✅ Register response:', registerRes);

    // --- Kiểm tra user trong DB
    const userFromDB = await User.findOne({ email: testEmail });
    console.log('👀 User from DB:', userFromDB);

    // --- So sánh password hash trong DB với plaintext
    const match = await bcrypt.compare(testPassword, userFromDB.password);
    console.log('🔑 Password match with DB hash?', match);

    // --- Login bằng authService
    const loginRes = await authService.login({
      email: testEmail,
      password: testPassword,
    });
    console.log('✅ Login response:', loginRes);

    if (loginRes.success) {
      console.log('🎉 End-to-end test passed: register + login successful');
    } else {
      console.log('❌ End-to-end test failed: login unsuccessful');
    }

  } catch (err) {
    console.error('🛑 E2E test error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🛑 MongoDB connection closed');
    process.exit(0);
  }
})();
