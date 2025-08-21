// scripts/testUpdateDoctor.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const API_BASE = process.env.ba || 'http://localhost:5000/api';
const LOGIN_EMAIL = 'doctor_test@demo.com';
const LOGIN_PASSWORD = '123456';

async function runTest() {
  try {
    // --- 1. Đăng nhập để lấy token ---
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });
    const token = loginRes.data.data?.accessToken;
    if (!token) throw new Error('Không lấy được token');

    console.log('✅ Login thành công, token:', token);

    // --- 2. Tạo form data để cập nhật ---
    const formData = new FormData();
    formData.append('fullName', 'Bác sĩ Test Updated');
    formData.append('phone', '0987654321');
    formData.append('bio', 'Bio test updated');

    // Thêm file avatar nếu muốn test upload
    const avatarPath = './scripts/test-avatar.png'; // tạo file test-avatar.png sẵn
    if (fs.existsSync(avatarPath)) {
      formData.append('avatar', fs.createReadStream(avatarPath));
    }

    // --- 3. Gọi API update ---
    const updateRes = await axios.put(`${API_BASE}/doctors/me`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(),
      },
    });

    console.log('✅ Update response:', updateRes.data);

    // --- 4. Lấy lại profile để verify ---
    const profileRes = await axios.get(`${API_BASE}/doctors/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Profile after update:', profileRes.data);

  } catch (err) {
    console.error('❌ Test update failed:', err.response?.data || err.message);
  }
}

runTest();
