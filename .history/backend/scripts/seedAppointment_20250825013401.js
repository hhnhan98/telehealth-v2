// const DOCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYwNTk5ODcsImV4cCI6MTc1NjE0NjM4N30.WmXVhF_AVcdkM6CQS78KjazqAOWQ-U3b7ufk42nn3PA'; // token bác sĩ
// const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmEyNWZmM2I1NTQyYjdiMzA0ZSIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzU2MDYwMDM0LCJleHAiOjE3NTYxNDY0MzR9.dn2v8mvDC9F7cwQvweWtzG793V9l6DMAQs5qVceRC7s'; // token bệnh nhân test
// scripts/seedDoctorDashboard.js
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE = 'http://localhost:5000/api';
const DOCTOR_TOKEN = 'YOUR_DOCTOR_TOKEN_HERE';
const PATIENT_TOKEN = 'YOUR_PATIENT_TOKEN_HERE';

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

// ----- Tạo appointment hôm nay, tự kiểm tra lịch trùng -----
const createAppointment = async (doctor, vnTime = '10:00', reason = 'Test dashboard appointment') => {
  try {
    let [hour, minute] = vnTime.split(':').map(Number);

    // Lặp để tìm slot chưa trùng
    let appointment;
    let attempt = 0;
    while (attempt < 10) { // tối đa thử 10 lần
      const vnDatetime = dayjs().tz('Asia/Ho_Chi_Minh')
        .hour(hour).minute(minute).second(0);
      const utcDatetime = vnDatetime.utc().toISOString();

      const res = await axios.post(
        `${API_BASE}/appointments`,
        {
          doctorId: doctor._id,
          locationId: doctor.location._id,
          specialtyId: doctor.specialty._id,
          datetime: utcDatetime,
          date: vnDatetime.format('YYYY-MM-DD'),
          time: vnDatetime.format('HH:mm'),
          reason,
        },
        { headers: { Authorization: `Bearer ${PATIENT_TOKEN}` } }
      );

      if (res.data.success) {
        appointment = res.data.data.appointment;
        console.log('✅ Appointment tạo thành công:', appointment);
        console.log('>>> Appointment datetime stored in DB (UTC):', appointment.datetime);
        break;
      } else if (res.data.message.includes('Khung giờ đã được đặt')) {
        console.log('⚠ Slot trùng, thử tăng 30 phút');
        minute += 30;
        if (minute >= 60) {
          minute -= 60;
          hour += 1;
        }
        attempt++;
      } else {
        console.log('❌ Appointment tạo thất bại:', res.data.message);
        break;
      }
    }

    if (!appointment) console.log('❌ Không tạo được appointment sau 10 lần thử');
    return appointment;
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
  await createAppointment(doctor, '11:00', 'Kiểm tra dashboard 1');
  await createAppointment(doctor, '13:00', 'Kiểm tra dashboard 2');

  // Kiểm tra dashboard
  await testDoctorDashboard();
})();
