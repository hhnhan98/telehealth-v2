// checkBackendData.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api'; // đổi sang URL backend của bạn

const checkData = async () => {
  try {
    console.log('=== Kiểm tra cơ sở y tế ===');
    const locRes = await axios.get(`${BASE_URL}/appointments/locations`);
    console.log('Cơ sở y tế:', locRes.data);

    console.log('\n=== Kiểm tra chuyên khoa ===');
    const specRes = await axios.get(`${BASE_URL}/appointments/specialties`);
    console.log('Chuyên khoa:', specRes.data);

    console.log('\n=== Kiểm tra bác sĩ ===');
    const docRes = await axios.get(`${BASE_URL}/appointments/doctors?locationId=&specialtyId=`);
    console.log('Bác sĩ:', docRes.data);

    console.log('\n=== Kiểm tra lịch rảnh của bác sĩ (ví dụ doctorId + date) ===');
    const slotsRes = await axios.get(`${BASE_URL}/appointments/available-slots?doctorId=&date=`);
    console.log('Available slots:', slotsRes.data);

  } catch (err) {
    console.error('Lỗi khi gọi backend:', err.response?.data || err.message || err);
  }
};

checkData();
