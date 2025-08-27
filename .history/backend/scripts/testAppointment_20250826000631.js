/**
 * Script test backend xem chi tiết appointment của bác sĩ
 * Cách dùng: node scripts/testAppointmentAuto.js
 */

const axios = require('axios');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor'); // đường dẫn tới model Doctor

const API_BASE = 'http://localhost:5000/api';
const doctorCredentials = {
  email: 'doctor_strange@demo.com',
  password: '123456',
};

async function main() {
  try {
    // 1. Login bác sĩ
    const loginRes = await axios.post(`${API_BASE}/auth/login`, doctorCredentials);
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.user._id;
    console.log('✅ Token:', token);

    // 2. Tìm Doctor document
    await mongoose.connect('mongodb://127.0.0.1:27017/telehealth', { useNewUrlParser: true, useUnifiedTopology: true });
    const doctorDoc = await Doctor.findOne({ user: userId });
    if (!doctorDoc) throw new Error('Không tìm thấy Doctor document cho user này');
    const doctorId = doctorDoc._id.toString();
    console.log('✅ Doctor ID:', doctorId);

    // 3. Lấy danh sách appointment của bác sĩ
    const apptsRes = await axios.get(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const myAppointments = apptsRes.data.data.filter(a => a.doctor._id === doctorId);
    if (myAppointments.length === 0) throw new Error('Bác sĩ chưa có appointment nào');

    // 4. Chọn ngẫu nhiên 1 appointment
    const randomAppointment = myAppointments[Math.floor(Math.random() * myAppointments.length)];
    console.log('✅ Random appointment ID:', randomAppointment._id);

    // 5. Lấy chi tiết appointment
    const detailRes = await axios.get(`${API_BASE}/appointments/${randomAppointment._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Chi tiết appointment:', detailRes.data.data);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Lỗi test:', err.response?.status, err.response?.data || err.message);
  }
}

main();
