/**
 * Script test backend xem chi tiết appointment
 * Cách dùng: node testAppointment.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api'; // đổi port nếu khác
const doctorCredentials = {
  email: 'doctor_strange@demo.com', // email bác sĩ đã seed
  password: '123456',           // mật khẩu
};
const appointmentId = '68a5efd59825b4e90b68db7f'; // ID appointment cần test

async function main() {
  try {
    // 1. Login bác sĩ để lấy token
    const loginRes = await axios.post(`${API_BASE}/auth/login`, doctorCredentials);
    const token = loginRes.data.data.token;
    console.log('✅ Lấy token thành công:', token);

    // 2. Gọi API lấy chi tiết appointment
    const appointmentRes = await axios.get(`${API_BASE}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Chi tiết appointment:', appointmentRes.data.data);
  } catch (err) {
    console.error('❌ Lỗi khi test appointment:', err.response?.status, err.response?.data);
  }
}

main();
