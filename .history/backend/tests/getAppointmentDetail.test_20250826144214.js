// test/getAppointmentDetail.test.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const DOCTOR_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // thay bằng token thực tế
const APPOINTMENT_ID = '68ac4bb7ffd75e7b09183608'; // ID của appointment cần test

async function testGetAppointmentDetail() {
  try {
    const res = await axios.get(`${BASE_URL}/api/doctors/appointments/${APPOINTMENT_ID}`, {
      headers: { Authorization: `Bearer ${DOCTOR_TOKEN}` },
    });

    console.log('Status:', res.status);
    console.log('Response data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testGetAppointmentDetail();
