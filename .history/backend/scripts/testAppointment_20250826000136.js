/**
 * Script test backend xem chi tiết appointment
 * Lấy token bác sĩ, chọn ngẫu nhiên 1 appointment của bác sĩ để test
 * Cách dùng: node testAppointment.js
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
    console.log('✅ Lấy token thành công:', token);

    // 2. Lấy danh sách appointments của bác sĩ
    const listRes = await axios.get(`${API_BASE}/doctor/appointments?view=all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const appointments = listRes.data.data;
    if (!appointments || appointments.length === 0) {
      console.log('⚠️ Bác sĩ không có appointment nào để test');
      return;
    }

    // 3. Chọn ngẫu nhiên 1 appointment
    const randomAppointment = appointments[Math.floor(Math.random() * appointments.length)];
    console.log('🎯 Chọn appointment ID:', randomAppointment._id);

    // 4. Gọi API lấy chi tiết appointment
    const appointmentRes = await axios.get(`${API_BASE}/appointments/${randomAppointment._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Chi tiết appointment:', appointmentRes.data.data);
  } catch (err) {
    console.error('❌ Lỗi khi test appointment:', err.response?.status, err.response?.data || err.message);
  }
}

main();
