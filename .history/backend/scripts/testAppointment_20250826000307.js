const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const doctorCredentials = {
  email: 'doctor_strange@demo.com',
  password: '123456',
};

async function main() {
  try {
    // 1. Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, doctorCredentials);
    const token = loginRes.data.data.token;
    console.log('✅ Token:', token);

    // 2. Lấy danh sách appointments của bác sĩ
    const listRes = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appointments = listRes.data.data;
    if (!appointments || appointments.length === 0) {
      console.log('⚠️ Chưa có appointment nào');
      return;
    }

    // 3. Chọn ngẫu nhiên 1 appointment
    const appointment = appointments[Math.floor(Math.random() * appointments.length)];
    console.log('ℹ️ Appointment chọn:', appointment._id);

    // 4. Lấy chi tiết appointment
    const detailRes = await axios.get(`${API_BASE}/appointments/${appointment._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Chi tiết appointment:', detailRes.data.data);

  } catch (err) {
    console.error('❌ Lỗi test:', err.response?.status, err.response?.data || err.message);
  }
}

main();
