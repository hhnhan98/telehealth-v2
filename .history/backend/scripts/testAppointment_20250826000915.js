/**
 * Script test backend xem chi tiết appointment
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

    // 2. Kiểm tra thông tin user
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('ℹ️ User info:', meRes.data.data);

    if (meRes.data.data.role !== 'doctor') {
      console.log('❌ User không phải bác sĩ, script dừng');
      return;
    }

    // 3. Lấy danh sách appointment của bác sĩ
    const listRes = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('ℹ️ Raw appointments list:', listRes.data);

    const appointments = listRes.data.data;
    if (!appointments || appointments.length === 0) {
      console.log('❌ Bác sĩ chưa có appointment nào hoặc không có quyền xem');
      return;
    }

    // 4. Chọn ngẫu nhiên 1 appointment
    const randomIndex = Math.floor(Math.random() * appointments.length);
    const appointmentId = appointments[randomIndex]._id;
    console.log('ℹ️ Random appointmentId:', appointmentId);

    // 5. Lấy chi tiết appointment
    const detailRes = await axios.get(`${API_BASE}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Chi tiết appointment:', detailRes.data.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ Lỗi test:', err.response.status, err.response.data);
    } else {
      console.error('❌ Lỗi test (no response):', err.message);
    }
  }
}

main();
