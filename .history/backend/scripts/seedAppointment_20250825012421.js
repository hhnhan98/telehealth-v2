// scripts/testDoctorDashboard.js
import axios from 'axios';
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE = 'http://localhost:5000/api';
const DOCTOR_TOKEN = '...'; // token bác sĩ
const PATIENT_TOKEN = '...'; // token bệnh nhân test

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
const createAppointment = async (doctor, time = '10:00', reason = 'Test dashboard appointment') => {
  try {
    const todayDate = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    const res = await axios.post(
      `${API_BASE}/appointments`,
      {
        doctorId: doctor._id,
        locationId: doctor.location._id,
        specialtyId: doctor.specialty._id,
        date: todayDate,
        time,
        reason,
      },
      { headers: { Authorization: `Bearer ${PATIENT_TOKEN}` } }
    );

    if (res.data.success) {
      console.log('✅ Appointment tạo thành công:', res.data.data.appointment);
      console.log('>>> Appointment datetime stored in DB:', res.data.data.appointment.datetime);
      return res.data.data.appointment;
    } else {
      console.log('❌ Appointment tạo thất bại:', res.data.message);
    }
  } catch (err) {
    console.error('❌ Lỗi createAppointment:', err.response?.data || err.message);
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

  // Tạo 2 appointment hôm nay để chắc chắn dashboard có dữ liệu
  await createAppointment(doctor, '10:00', 'Kiểm tra dashboard 1');
  await createAppointment(doctor, '14:00', 'Kiểm tra dashboard 2');

  // Kiểm tra dashboard
  await testDoctorDashboard();
})();
