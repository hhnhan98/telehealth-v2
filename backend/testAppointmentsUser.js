// testAppointmentsUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
const Doctor = require('./models/Doctor'); 
const Specialty = require('./models/Specialty'); 
const Location = require('./models/Location'); // đảm bảo import đủ
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Thay token bằng token đang dùng FE
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTE0OGEzMDM3YzUwYjAyZGFjZjQwYSIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzU1NDA1NzU5LCJleHAiOjE3NTYwMTA1NTl9.Y06vaVT_MDaR-8R31iXhzV2QpVZv95LJp_nCgAz8gNo';

async function main() {
  try {
    // 1. Kết nối MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // 2. Decode token lấy userId
    const decoded = jwt.verify(TEST_TOKEN, JWT_SECRET);
    console.log('UserId từ token:', decoded.id);

    // 3. Lấy thông tin user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ Không tìm thấy user trong DB');
      return;
    }
    console.log('User info:', { id: user._id, fullName: user.fullName, email: user.email });

    // 4. Lấy tất cả appointment của user, populate đầy đủ
    const appointments = await Appointment.find({ patient: user._id })
      .populate('doctor', 'fullName')    // tên bác sĩ
      .populate('specialty', 'name')     // tên chuyên khoa
      .populate('location', 'name')      // tên cơ sở
      .sort({ datetime: -1 });

    console.log(`\nTổng số appointment của user: ${appointments.length}\n`);

    // 5. In chi tiết từng lịch
    appointments.forEach((appt, i) => {
      console.log(`--- Lịch hẹn [${i + 1}] ---`);
      console.log('ID:', appt._id.toString());
      console.log('Ngày:', appt.date);
      console.log('Giờ:', appt.time);
      console.log('Cơ sở:', appt.location?.name || 'Chưa có');
      console.log('Chuyên khoa:', appt.specialty?.name || 'Chưa có');
      console.log('Bác sĩ:', appt.doctor?.fullName || 'Chưa có');
      console.log('Trạng thái:', appt.status);
      console.log('Đã xác thực:', appt.isVerified);
      console.log('------------------------\n');
    });

    // 6. Ngắt kết nối
    await mongoose.disconnect();
    console.log('✅ Ngắt kết nối MongoDB thành công');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }
}

main();
