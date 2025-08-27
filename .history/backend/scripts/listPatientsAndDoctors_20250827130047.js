const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
require('dotenv').config();

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    console.log('=== 📋 DANH SÁCH DOCTORS ===');
    const doctors = await Doctor.find().populate('user', 'fullName email role');
    doctors.forEach((doc, i) => {
      console.log(`
#${i + 1}
 DoctorId: ${doc._id}
 UserId:   ${doc.user?._id}
 Name:     ${doc.user?.fullName}
 Email:    ${doc.user?.email}
 Role:     ${doc.user?.role}
      `);
    });

    console.log('\n=== 📋 DANH SÁCH PATIENTS ===');
    const patients = await Patient.find().populate('user', 'fullName email role');
    patients.forEach((pat, i) => {
      console.log(`
#${i + 1}
 PatientId: ${pat._id}
 UserId:    ${pat.user?._id}
 Name:      ${pat.user?.fullName}
 Email:     ${pat.user?.email}
 Role:      ${pat.user?.role}
      `);
    });

    console.log('\n✅ Hoàn tất liệt kê danh sách.');
  } catch (err) {
    console.error('❌ Lỗi khi liệt kê:', err);
  } finally {
    await mongoose.disconnect();
  }
};

main();
