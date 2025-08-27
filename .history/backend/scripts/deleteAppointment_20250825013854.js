// scripts/deleteDoctorAppointments.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const DOCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYwNTk5ODcsImV4cCI6MTc1NjE0NjM4N30.WmXVhF_AVcdkM6CQS78KjazqAOWQ-U3b7ufk42nn3PAeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYwNjA3MTQsImV4cCI6MTc1NjE0NzExNH0.ApVfnoMI8tVrmTPHl1DyVggawnu8tUT8p5QKZZG_1ag'; // token bác sĩ hoặc admin

// Thay bằng ID bác sĩ muốn xóa
const DOCTOR_ID = '68aad6e45ff3b5542b7b3066';

const deleteDoctorAppointments = async () => {
  try {
    const res = await axios.delete(`${API_BASE}/appointments/doctor/${DOCTOR_ID}`, {
      headers: { Authorization: `Bearer ${DOCTOR_TOKEN}` },
    });

    if (res.data.success) {
      console.log(`✅ Xóa thành công ${res.data.deletedCount} appointment(s) của bác sĩ ${DOCTOR_ID}`);
    } else {
      console.log('❌ Xóa thất bại:', res.data.message);
    }
  } catch (err) {
    console.error('❌ Lỗi xóa appointment:', err.response?.data || err.message);
  }
};

deleteDoctorAppointments();
