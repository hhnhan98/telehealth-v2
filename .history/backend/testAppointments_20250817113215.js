require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/appointments'; // sửa port nếu khác
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTE0OGEzMDM3YzUwYjAyZGFjZjQwYSIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzU1NDAwMzc0LCJleHAiOjE3NTYwMDUxNzR9.ds57HPsH7UF5K5Mm6026JjK1YKpb8OLVikviG9rzQZI'; // dán token user hiện tại

const testFetchAppointments = async () => {
  try {
    const res = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    console.log('✅ Response data:');
    console.log(JSON.stringify(res.data, null, 2));

    if (!res.data.appointments || res.data.appointments.length === 0) {
      console.log('⚠️ Không có lịch hẹn nào trả về');
    } else {
      console.log(`✅ Tổng số lịch hẹn: ${res.data.appointments.length}`);
      console.log('Ví dụ 1 lịch hẹn:', res.data.appointments[0]);
    }
  } catch (err) {
    console.error('❌ Lỗi khi fetch appointments:', err.response?.data || err.message);
  }
};

testFetchAppointments();
