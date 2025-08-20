/**
 * scripts/testMismatch.js
 * Mục đích: Kiểm tra bác sĩ trong DB có specialty và location trùng khớp
 */

require('dotenv').config(); // Load .env
const mongoose = require('mongoose');

// Đường dẫn đến các model
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) throw new Error('MONGODB_URI chưa khai báo trong .env');

async function testDoctorMismatch() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('>>> Kết nối MongoDB thành công');

    // Lấy tất cả bác sĩ
    const doctors = await Doctor.find()
      .populate('user', 'fullName role')
      .populate('specialty', 'name location')
      .populate('location', 'name')
      .lean();

    if (doctors.length === 0) {
      console.log('>>> Không tìm thấy bác sĩ nào trong DB');
      process.exit(0);
    }

    console.log(`>>> Tìm thấy ${doctors.length} bác sĩ\n`);

    let mismatchCount = 0;

    doctors.forEach((doc, index) => {
      const userName = doc.user?.fullName || 'Unknown';
      const specialtyName = doc.specialty?.name || 'Unknown';
      const specialtyLoc = doc.specialty?.location?.toString();
      const doctorLoc = doc.location?._id.toString();

      const isMismatch = specialtyLoc !== doctorLoc;

      if (isMismatch) mismatchCount++;

      console.log(
        `${index + 1}. ${userName} | Specialty: ${specialtyName} | Location: ${doc.location?.name || 'Unknown'}${isMismatch ? ' ⚠️ MISMATCH' : ''}`
      );
    });

    if (mismatchCount === 0) {
      console.log('\n>>> Tất cả bác sĩ đều khớp specialty và location ✅');
    } else {
      console.log(`\n>>> Có ${mismatchCount} bác sĩ mismatch specialty-location ⚠️`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi khi kiểm tra mismatch:', err);
    process.exit(1);
  }
}

testDoctorMismatch();
