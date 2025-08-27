/**
 * Script test backend: lấy toàn bộ lịch hẹn bác sĩ
 * Cách dùng: node testAppointmentsDoctor.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api'; // đổi port nếu khác

// Thông tin đăng nhập bác sĩ (đã seed sẵn)
const doctorCredentials = {
  email: 'doctor_strange@demo.com',
  password: '123456',
};

async function main() {
  try {
    // 1. Login bác sĩ
    const loginRes = await axios.post(`${API_BASE}/auth/login`, doctorCredentials);
    const token = loginRes.data.data.token;
    console.log('✅ Token:', token);

    // 2. Lấy danh sách appointment của bác sĩ
    const appointmentsRes = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!appointmentsRes.data.success) {
      console.error('❌ Lỗi API:', appointmentsRes.data.message);
      return;
    }

    const { count, appointments } = appointmentsRes.data.data;

    console.log(`🔹 Tổng số appointment: ${count}`);

    if (!appointments || appointments.length === 0) {
      console.log('⚠️ Không có appointment nào để hiển thị.');
      return;
    }

    // 3. Hiển thị chi tiết từng appointment
    appointments.forEach((a, idx) => {
      console.log(`\n--- Appointment ${idx + 1} ---`);
      console.log('ID:', a._id);
      console.log('Bệnh nhân:', a.patient); // nếu API populate patient thì sẽ là object
      console.log('Ngày/giờ:', a.date, a.time);
      console.log('Lý do:', a.reason);
      console.log('Trạng thái:', a.status);
    });

  } catch (err) {
    console.error('❌ Lỗi test:', err.response?.status, err.response?.data || err.message);
  }
}

main();
