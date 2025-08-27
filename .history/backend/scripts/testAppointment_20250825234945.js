// testAppointment.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/appointments'; // đổi port nếu cần
const APPOINTMENT_ID = '64c123abc456def7890ccc56'; // ID bạn muốn test
const TOKEN = 'eyJhbGciOi...'; // token của bác sĩ đã đăng nhập

async function testGetAppointment() {
  try {
    const { data } = await axios.get(`${API_URL}/${APPOINTMENT_ID}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    console.log('Response data:', data);
  } catch (err) {
    console.error('Lỗi khi gọi API:', err.response?.status, err.response?.data || err.message);
  }
}

testGetAppointment();
