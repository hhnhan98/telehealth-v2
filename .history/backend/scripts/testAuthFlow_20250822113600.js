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
