const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// --- Cấu hình ---
const API_BASE = 'http://localhost:5000/api/doctors';
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTcwMzJmY2ZjMzYyNjM2MmVmYmI3MyIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTU3ODYzMDUsImV4cCI6MTc1NjM5MTEwNX0.up6EWVNdamkkEsWq9gIiNy23Kak54jKkY85Tn-sj6Ik'; // Thay bằng token đăng nhập của bác sĩ

const testUpdateProfile = async () => {
  try {
    // 1️⃣ Lấy profile hiện tại
    const profileRes = await axios.get(`${API_BASE}/me`, {
      headers: { Authorization: TOKEN },
    });
    console.log('Profile hiện tại:', profileRes.data.data);

    // 2️⃣ Tạo form-data để update (có thể upload avatar)
    const form = new FormData();
    form.append('fullName', 'Dr. Test Updated');
    form.append('phone', '0912345678');
    form.append('bio', 'Bio test update ngay sau khi save.');

    // --- Test năm sinh ---
    form.append('birthYear', '1990'); // Thay đổi năm sinh tại đây

    // form.append('avatar', fs.createReadStream('./avatar_test.jpg')); // Nếu muốn test upload

    // 3️⃣ Gửi PUT request update profile
    const updateRes = await axios.put(`${API_BASE}/me`, form, {
      headers: {
        Authorization: TOKEN,
        ...form.getHeaders(),
      },
    });

    console.log('Response update:', updateRes.data);

    // 4️⃣ Lấy lại profile sau update
    const newProfileRes = await axios.get(`${API_BASE}/me`, {
      headers: { Authorization: TOKEN },
    });
    console.log('Profile sau update:', newProfileRes.data.data);

    console.log('✅ Test backend update profile hoàn tất');
  } catch (err) {
    console.error('❌ Lỗi test backend:', err.response?.data || err.message);
  }
};

testUpdateProfile();
