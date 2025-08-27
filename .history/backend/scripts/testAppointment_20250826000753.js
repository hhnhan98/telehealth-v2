/**
 * Script test backend xem chi tiết appointment
 * Cách dùng: node scripts/testAppointment.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api'; // port backend
const doctorCredentials = {
  email: 'doctor_strange@demo.com', // email bác sĩ đã seed
  password: '123456',
};

async function main() {
  try {
    // 1. Login bác sĩ để lấy token
    const loginRes = await axios.post(`${API_BASE}/auth/login`, doctorCredentials);
    const token = loginRes.data.data.token;
    console.log('✅ Token:', token);

    // 2. Lấy danh sách appointment của bác sĩ
    const listRes = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const appointments = listRes.data.data;
    if (!appointments || appointments.length === 0) {
      console.log('❌ Bác sĩ chưa có appointment nào');
      return;
    }

    // 3. Lấy ngẫu nhiên 1 appointment
    const randomIndex = Math.floor(Math.random() * appointments.length);
    const appointmentId = appointments[randomIndex]._id;
    console.log('✅ Test appointment ID:', appointmentId);

    // 4. Gọi API chi tiết appointment
    const appointmentRes = await axios.get(`${API_BASE}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Chi tiết appointment:', appointmentRes.data.data);
  } catch (err) {
    console.error('❌ Lỗi test:', err.response?.status, err.response?.data || err.message);
  }
}

main();
