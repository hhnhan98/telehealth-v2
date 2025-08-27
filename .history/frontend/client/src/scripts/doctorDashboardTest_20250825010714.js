// src/scripts/doctorDashboardTest.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const DOCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYwNTgxODUsImV4cCI6MTc1NjE0NDU4NX0.j5-yu3R9Iy0Lqlx076OW-YlDVtim0jFsqkvhgelXi_4'; 
// Thay bằng token thực của bác sĩ

const testDoctorDashboard = async () => {
  try {
    const res = await axios.get(`${API_BASE}/doctor/dashboard`, {
      headers: {
        Authorization: `Bearer ${DOCTOR_TOKEN}`,
      },
    });

    console.log('✅ API Dashboard response:', res.data);

    const todayAppointments = res.data?.data?.todayAppointments || [];
    const weeklyAppointmentsCount = res.data?.data?.weeklyAppointmentsCount;

    console.log(`→ Today appointments (${todayAppointments.length}):`, todayAppointments.map(a => ({
      time: new Date(a.datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }),
      patient: a.patient?.fullName || 'Không có thông tin',
      status: a.status
    })));
    console.log('→ Weekly appointments count:', weeklyAppointmentsCount);

  } catch (err) {
    console.error('❌ API Dashboard error:', err.response?.data || err.message);
  }
};

testDoctorDashboard();
