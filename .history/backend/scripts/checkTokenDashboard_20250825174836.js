// scripts/checkTokenDashboard.js
const axios = require('axios');

// Thay token hiện tại của bạn
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYxMTU5NDUsImV4cCI6MTc1NjIwMjM0NX0.gk9EqOIVZ5jyoTHkm5jh80wGc3NSXzPrUJB1jBRmGUw';

async function checkDashboard() {
  try {
    console.log('📌 Token hiện tại:', token);

    const res = await axios.get('http://localhost:5000/api/doctor/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('📌 API response:', res.data);

    const data = res.data.data || {};
    console.log('📌 Today Appointments:', data.todayAppointments);
    console.log('📌 Weekly Appointments Count:', data.weeklyAppointmentsCount);
    console.log('📌 Pending Count:', data.pendingCount);
    console.log('📌 Confirmed Count:', data.confirmedCount);
    console.log('📌 Total Slots:', data.totalSlots);
    console.log('📌 Booked Slots:', data.bookedSlots);
    console.log('📌 Free Slots:', data.freeSlots);
    console.log('📌 Booking Rate:', data.bookingRate);
  } catch (err) {
    console.error('❌ Lỗi khi gọi dashboard API:', err.response?.data || err.message);
  }
}

checkDashboard();
