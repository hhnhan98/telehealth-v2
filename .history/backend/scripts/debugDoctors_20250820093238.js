const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

async function debugDoctors(locationId, specialtyId) {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Thiếu MONGODB_URI trong .env');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Kiểm tra đầu vào
    console.log('Location ID:', locationId);
    console.log('Specialty ID:', specialtyId);

    // Kiểm tra xem Location và Specialty có tồn tại không
    const location = await Location.findById(locationId);
    const specialty = await Specialty.findById(specialtyId);
    if (!location) console.warn('❌ Location không tồn tại');
    if (!specialty) console.warn('❌ Specialty không tồn tại');

    // Query doctors
    const doctors = await Doctor.find({ location: locationId, specialty: specialtyId })
      .populate('user', 'fullName email')
      .populate('specialty', 'name')
      .populate('location', 'name');

    console.log('\n--- Doctors found ---');
    if (!doctors.length) {
      console.warn('❌ Không tìm thấy bác sĩ cho location + specialty này');
    } else {
      doctors.forEach(d => {
        console.log(`${d._id} | ${d.user?.fullName} | ${d.specialty?.name} | ${d.location?.name}`);
      });
      console.log(`\n✅ Tổng số bác sĩ: ${doctors.length}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Debug failed:', err);
    process.exit(1);
  }
}

// ------------------------
// Chạy script với 2 tham số: locationId và specialtyId
// VD: node scripts/debugDoctors.js 68a4b58b9b99d9c42a603cb7 68a4b58c9b99d9c42a603cbb
// ------------------------
const [locationId, specialtyId] = process.argv.slice(2);
if (!locationId || !specialtyId) {
  console.error('❌ Vui lòng cung cấp locationId và specialtyId');
  process.exit(1);
}

debugDoctors(locationId, specialtyId);
