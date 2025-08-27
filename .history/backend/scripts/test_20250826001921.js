/**
 * Script test backend DoctorAppointmentDetail
 * Cách dùng: node scripts/testDoctorAPIs.js
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
    console.log('✅ Lấy token thành công:', token);

    // 2. Lấy danh sách appointment của bác sĩ
    const appointmentsRes = await axios.get(`${API_BASE}/doctor/appointments?view=all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const appointments = appointmentsRes.data.data.appointments;
    console.log(`🔹 Tổng số appointment: ${appointments.length}`);

    if (!appointments.length) {
      console.log('⚠️ Không có appointment nào để test.');
      return;
    }

    // 3. Chọn một appointment đầu tiên
    const appointmentId = appointments[0]._id;
    console.log('🔹 Test chi tiết appointment ID:', appointmentId);

    // 4. Lấy chi tiết appointment
    const detailRes = await axios.get(`${API_BASE}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const appointmentDetail = detailRes.data.data;
    console.log('✅ Chi tiết appointment:', appointmentDetail);

    // 5. Kiểm tra các field cần thiết cho FE
    console.log('🔹 Kiểm tra các trường cơ bản:');
    console.log('Bệnh nhân:', appointmentDetail.patient?.fullName);
    console.log('Bác sĩ:', appointmentDetail.doctor?.fullName);
    console.log('Chuyên khoa:', appointmentDetail.specialty?.name);
    console.log('Cơ sở:', appointmentDetail.location?.name);
    console.log('Ngày/giờ:', appointmentDetail.date, appointmentDetail.time);
    console.log('Lý do:', appointmentDetail.reason);
    console.log('Trạng thái:', appointmentDetail.status);

  } catch (err) {
    console.error('❌ Lỗi test:', err.response?.status, err.response?.data || err.message);
  }
}

main();
