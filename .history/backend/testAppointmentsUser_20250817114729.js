// testAppointmentsUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
const Doctor = require('./models/Doctor'); 
const Specialty = require('./models/Specialty'); 
const Doctor = require('./models/Doctor'); 
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Thay token bằng token bạn đang dùng ở FE
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTE0OGEzMDM3YzUwYjAyZGFjZjQwYSIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzU1NDA1NzU5LCJleHAiOjE3NTYwMTA1NTl9.Y06vaVT_MDaR-8R31iXhzV2QpVZv95LJp_nCgAz8gNo';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Decode token để lấy userId
    const decoded = jwt.verify(TEST_TOKEN, JWT_SECRET);
    console.log('UserId từ token:', decoded.id);

    // Lấy user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ Không tìm thấy user trong DB');
      return;
    }
    console.log('User info:', { id: user._id, fullName: user.fullName, email: user.email });

    // Lấy tất cả appointment của user
    const appointments = await Appointment.find({ patient: user._id })
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .sort({ datetime: -1 });

    console.log(`Tổng số appointment của user: ${appointments.length}`);
    appointments.forEach((appt, i) => {
      console.log(`\n[${i+1}]`, {
        _id: appt._id,
        date: appt.date,
        time: appt.time,
        doctor: appt.doctor?.fullName,
        specialty: appt.specialty?.name,
        location: appt.location?.name,
        status: appt.status,
        isVerified: appt.isVerified,
      });
    });

    await mongoose.disconnect();
    console.log('✅ Ngắt kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }
}

main();
