import axios from 'axios';

const API_BASE = 'http://localhost:5000/api'; // đổi theo backend của bạn
const DOCTOR_TOKEN = '<YOUR_DOCTOR_JWT_HERE>'; // thay bằng token bác sĩ

const testDoctorDashboard = async () => {
  try {
    const res = await axios.get(`${API_BASE}/doctors/dashboard`, {
      headers: {
        Authorization: `Bearer ${DOCTOR_TOKEN}`,
      },
    });

    console.log('✅ API Dashboard response:', res.data);

    const todayAppointments = res.data?.data?.todayAppointments || [];
    const weeklyAppointmentsCount = res.data?.data?.weeklyAppointmentsCount;

    console.log('→ Today appointments:', todayAppointments);
    console.log('→ Weekly appointments count:', weeklyAppointmentsCount);
  } catch (err) {
    console.error('❌ API Dashboard error:', err.response?.data || err.message);
  }
};

testDoctorDashboard();
