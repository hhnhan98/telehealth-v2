require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

const MONGO_URI = process.env.MONGODB_URI;
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000'; // đổi theo backend port

// Test params: thay bằng ID thật từ step 1
const locationId = '68a34f7a49463b38f8b5d5ac';
const specialtyId = '68a34f7a49463b38f8b5d5b0';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('>>> Kết nối MongoDB thành công');

    // Gọi API backend
    const res = await axios.get(`${BASE_URL}/appointments/doctors`, {
      params: { locationId, specialtyId },
    });

    console.log('>>> API trả về dữ liệu:', res.data);

    if (res.data?.data?.count > 0) {
      console.log('>>> Danh sách bác sĩ tìm thấy:');
      res.data.data.doctors.forEach(d => console.log(`- ${d.fullName} | ${d._id}`));
    } else {
      console.log('>>> Không tìm thấy bác sĩ nào');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('*** Lỗi khi test API:', err.message || err);
  }
}

testAPI();
