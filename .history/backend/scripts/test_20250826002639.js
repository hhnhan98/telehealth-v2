// scripts/testDoctorAppointments.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/doctor'; // đổi theo server của bạn
const TEST_DOCTOR_EMAIL = 'doctor@example.com'; // email doctor
const TEST_DOCTOR_PASSWORD = '123456';           // password doctor

async function run() {
  try {
    // 1️⃣ Đăng nhập (giả sử /auth/login tồn tại)
    console.log('🔹 Đăng nhập doctor...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: TEST_DOCTOR_EMAIL,
      password: TEST_DOCTOR_PASSWORD,
    });
    const token = loginRes.data.data?.token;
    console.log('✅ Token:', token);

    const headers = { Authorization: `Bearer ${token}` };

    // 2️⃣ Lấy profile
    const profileRes = await axios.get(`${BASE_URL}/me`, { headers });
    console.log('🔹 Profile:', profileRes.data.data);

    // 3️⃣ Lấy danh sách appointment
    const apptRes = await axios.get(`${BASE_URL}/appointments`, { headers });
    const appointments = apptRes.data.data?.appointments || [];
    console.log(`🔹 Tổng số appointment: ${appointments.length}`);

    if (appointments.length === 0) {
      console.log('⚠️ Không có appointment nào để test chi tiết.');
      return;
    }

    // 4️⃣ Lấy chi tiết appointment đầu tiên
    const firstApptId = appointments[0]._id;
    const detailRes = await axios.get(`${BASE_URL}/appointments/${firstApptId}`, { headers });
    console.log('🔹 Chi tiết appointment đầu tiên:', detailRes.data.data);

    // 5️⃣ Cập nhật trạng thái appointment (test chuyển sang confirmed)
    const updateRes = await axios.patch(
      `${BASE_URL}/appointments/${firstApptId}/status`,
      { status: 'confirmed' },
      { headers }
    );
    console.log('🔹 Cập nhật trạng thái:', updateRes.data.data);

    // 6️⃣ Tạo phiếu khám cho appointment
    const receiptRes = await axios.post(
      `${BASE_URL}/appointments/${firstApptId}/medical-receipt`,
      { diagnosis: 'Test diagnosis', prescription: 'Test prescription' },
      { headers }
    );
    console.log('🔹 Tạo phiếu khám:', receiptRes.data.data);

    // 7️⃣ (Tùy chọn) Hủy appointment
    // const cancelRes = await axios.delete(`${BASE_URL}/appointments/${firstApptId}`, { headers });
    // console.log('🔹 Hủy appointment:', cancelRes.data.data);

  } catch (err) {
    console.error('❌ Lỗi test:', err.response?.data || err.message);
  }
}

run();
