// src/scripts/testDoctorDashboard.js
import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE = 'http://localhost:5000/api';
const DOCTOR_TOKEN = '<THAY_BẰNG_TOKEN_BÁC_SĨ_CỦA_BẠN>';

const testDoctorDashboard = async () => {
  try {
    // Lấy ngày hôm nay theo VN để log
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStartUTC = todayVN.startOf('day').utc().toDate();
    const todayEndUTC = todayVN.endOf('day').utc().toDate();
    console.log('>>> Today UTC range for check:', todayStartUTC, '-', todayEndUTC);

    const res = await axios.get(`${API_BASE}/doctor/dashboard`, {
      headers: {
        Authorization: `Bearer ${DOCTOR_TOKEN}`,
      },
    });

    console.log('✅ API Dashboard response:', res.data);

    const todayAppointments = res.data?.data?.todayAppointments || [];
    const weeklyAppointmentsCount = res.data?.data?.weeklyAppointmentsCount || 0;

    console.log(`→ Today appointments (${todayAppointments.length}):`, todayAppointments.map(a => ({
      time: a.datetime,
      patient: a.patient?.fullName,
      status: a.status,
      reason: a.reason
    })));
    console.log('→ Weekly appointments count:', weeklyAppointmentsCount);

  } catch (err) {
    console.error('❌ API Dashboard error:', err.response?.data || err.message);
  }
};

testDoctorDashboard();
