/**
 * Script test backend xem chi tiết appointment tự động
 * Cách dùng: node scripts/testAppointment.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api'; // đổi port nếu khác
const doctorCredentials = {
  email: 'doctor_strange@demo.com', // email bác sĩ đã seed
  password: '123456',               // mật khẩu
};

async function main() {
  try {
    // 1. Login bác sĩ để lấy token
    const loginRes = await axios.post(`${API_BASE}/auth/login`, doctorCredentials);
    const token = loginRes.data.data.token;
    console.log('✅ Token:', token);

    // 2. Lấy danh sách appointment của bác sĩ
    const appointmentsRes = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const appointments = appointmentsRes.data.data;
    if (!appointments || appointments.length === 0) {
      console.log('⚠️ Không có appointment nào cho bác sĩ này.');
      return;
    }

    // 3. Chọn ngẫu nhiên 1 appointment
    const randomAppointment = appointments[Math.floor(Math.random() * appointments.length)];
    console.log('✅ Chọn appointment ID:', randomAppointment._id);

    // 4. Lấy chi tiết appointment
    const detailRes = await axios.get(`${API_BASE}/appointments/${randomAppointment._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Chi tiết appointment:', detailRes.data.data);
  } catch (err) {
    console.error('❌ Lỗi test:', err.response?.status, err.response?.data || err.message);
  }
}

main();
