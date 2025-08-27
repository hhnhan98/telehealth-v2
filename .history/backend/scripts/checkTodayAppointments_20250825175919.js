// scripts/checkTodayAppointments.js
const axios = require('axios');

const TOKEN = 'YOUR_TOKEN_HERE'; // Thay bằng token bác sĩ hiện tại

const checkDashboard = async () => {
  try {
    console.log('📌 Sử dụng token:', TOKEN);

    const res = await axios.get('http://localhost:5000/api/doctor/dashboard', {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    console.log('📌 API response success:', res.data.success);
    console.log('📌 Dashboard message:', res.data.message);

    const data = res.data.data;
    console.log('📌 Today Appointments:', data.todayAppointments);
    console.log('📌 Weekly Appointments Count:', data.weeklyAppointmentsCount);
    console.log('📌 Pending Count:', data.pendingCount);
    console.log('📌 Confirmed Count:', data.confirmedCount);
    console.log('📌 Total Slots:', data.totalSlots);
    console.log('📌 Booked Slots:', data.bookedSlots);
    console.log('📌 Free Slots:', data.freeSlots);
    console.log('📌 Booking Rate:', data.bookingRate);

  } catch (err) {
    console.error('❌ Lỗi khi fetch dashboard:', err.response?.data || err.message);
  }
};

checkDashboard();
