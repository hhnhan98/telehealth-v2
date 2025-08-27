// src/scripts/testDoctorDashboard.js
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE = 'http://localhost:5000/api';
const DOCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYwNTgxODUsImV4cCI6MTc1NjE0NDU4NX0.j5-yu3R9Iy0Lqlx076OW-YlDVtim0jFsqkvhgelXi_4';

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
