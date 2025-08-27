import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE = 'http://localhost:5000/api';
const DOCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYwNTgxODUsImV4cCI6MTc1NjE0NDU4NX0.j5-yu3R9Iy0Lqlx076OW-YlDVtim0jFsqkvhgelXi_4'; // Thay bằng token bác sĩ
const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmEyNWZmM2I1NTQyYjdiMzA0ZSIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzU2MDU4NjM3LCJleHAiOjE3NTYxNDUwMzd9.YMZaMB7fCpYNAwSoSl7U0wROKV6wvub9AJC3OAkAG5U'; // Thay bằng token bệnh nhân test

// ----- Lấy thông tin bác sĩ để biết specialty + location -----
const getDoctorInfo = async () => {
  try {
    const res = await axios.get(`${API_BASE}/doctors/me`, {
      headers: { Authorization: `Bearer ${DOCTOR_TOKEN}` },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  } catch (err) {
    console.error('❌ Lỗi getDoctorInfo:', err.response?.data || err.message);
  }
};

// ----- Tạo appointment hợp lệ cho hôm nay -----
const createAppointmentToday = async (doctor) => {
  try {
    const todayDate = dayjs().format('YYYY-MM-DD');
    const time = '10:00'; // giờ khám thử

    const res = await axios.post(
      `${API_BASE}/appointments`,
      {
        doctorId: doctor._id,
        locationId: doctor.location._id,
        specialtyId: doctor.specialty._id,
        date: todayDate,
        time,
        reason: 'Test dashboard appointment',
      },
      { headers: { Authorization: `Bearer ${PATIENT_TOKEN}` } }
    );

    if (res.data.success) {
      console.log('✅ Appointment tạo thành công:', res.data.data.appointment);
    } else {
      console.log('❌ Appointment tạo thất bại:', res.data.message);
    }
  } catch (err) {
    console.error('❌ Lỗi createAppointmentToday:', err.response?.data || err.message);
  }
};

// ----- Kiểm tra dashboard bác sĩ -----
const testDoctorDashboard = async () => {
  try {
    const res = await axios.get(`${API_BASE}/doctor/dashboard`, {
      headers: { Authorization: `Bearer ${DOCTOR_TOKEN}` },
    });

    console.log('✅ Dashboard response:', res.data);
    const todayAppointments = res.data?.data?.todayAppointments || [];
    const weeklyAppointmentsCount = res.data?.data?.weeklyAppointmentsCount;

    console.log('→ Today appointments:', todayAppointments.length, todayAppointments);
    console.log('→ Weekly appointments count:', weeklyAppointmentsCount);
  } catch (err) {
    console.error('❌ API Dashboard error:', err.response?.data || err.message);
  }
};

// ----- Main -----
(async () => {
  const doctor = await getDoctorInfo();
  if (!doctor) return;

  await createAppointmentToday(doctor);
  await testDoctorDashboard();
})();
