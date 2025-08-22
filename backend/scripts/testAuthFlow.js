// // scripts/testCreatePatient.js
// require('dotenv').config();
// const mongoose = require('mongoose');

// const User = require('../models/User');
// const Patient = require('../models/Patient');

// const testCreatePatient = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ MongoDB connected');

//     // --- Thay email này bằng user bạn muốn test
//     const emailToTest = 'patient_d@demo.com';

//     const user = await User.findOne({ email: emailToTest }).lean();
//     if (!user) {
//       console.log(`❌ Không tìm thấy user với email: ${emailToTest}`);
//       return;
//     }

//     console.log(`🔍 Tìm thấy user: ${user.fullName} (${user._id}), role = ${user.role}`);

//     if (user.role !== 'patient') {
//       console.log(`⚠️ User không phải là patient, không tạo document Patient`);
//       return;
//     }

//     const existingPatient = await Patient.findOne({ user: user._id });
//     if (existingPatient) {
//       console.log(`✅ Patient document đã tồn tại: ${user.fullName}`);
//     } else {
//       const patientDoc = await Patient.create({ user: user._id });
//       console.log(`🎉 Patient document đã được tạo: ${user.fullName}`);
//       console.log(patientDoc);
//     }
//   } catch (err) {
//     console.error('❌ Lỗi khi tạo Patient document:', err);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// testCreatePatient();

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api/auth';

const testRegisterAndLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // --- Test data
    const testUsers = [
      {
        fullName: 'Test Patient',
        email: `patient${Date.now()}@demo.com`,
        password: '123456',
        role: 'patient',
      },
      {
        fullName: 'Test Doctor',
        email: `doctor${Date.now()}@demo.com`,
        password: '123456',
        role: 'doctor',
        specialty: '', // <-- cập nhật ID chuyên khoa hợp lệ
        location: '',  // <-- cập nhật ID location hợp lệ
      },
    ];

    for (const user of testUsers) {
      console.log(`\n🔹 Testing register: ${user.role} - ${user.email}`);

      // --- Register
      try {
        const registerRes = await axios.post(`${API_BASE}/register`, user);
        console.log('Register response:', registerRes.data);
      } catch (err) {
        console.error('Register error:', err.response?.data || err.message);
        continue;
      }

      // --- Check Patient/Doctor doc
      const dbUser = await User.findOne({ email: user.email });
      if (!dbUser) {
        console.error('❌ User không tồn tại trong DB');
        continue;
      }

      if (user.role === 'patient') {
        const patientDoc = await Patient.findOne({ user: dbUser._id });
        console.log(patientDoc
          ? `✅ Patient document exists: ${patientDoc._id}`
          : `❌ Patient document NOT found`);
      } else if (user.role === 'doctor') {
        const doctorDoc = await Doctor.findOne({ user: dbUser._id });
        console.log(doctorDoc
          ? `✅ Doctor document exists: ${doctorDoc._id}`
          : `⚠️ Doctor document may be optional`);
      }

      // --- Login
      try {
        const loginRes = await axios.post(`${API_BASE}/login`, {
          email: user.email,
          password: user.password,
        });
        console.log('Login response token:', loginRes.data.token ? '✅ Token received' : '❌ Token missing');
      } catch (err) {
        console.error('Login error:', err.response?.data || err.message);
      }
    }

  } catch (err) {
    console.error('❌ Test script error:', err);
  } finally {
    mongoose.connection.close();
  }
};

testRegisterAndLogin();
