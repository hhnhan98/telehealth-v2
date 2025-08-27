// doctorId = '68aad6e45ff3b5542b7b3066'
const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE = 'http://localhost:5000/api'; // sửa theo BE của bạn

const doctorId = '68aad6e45ff3b5542b7b3066'; // Thay ID bác sĩ thực tế
const date = '2025-08-25';

async function testAvailableSlots() {
  try {
    const res = await axios.get(`${API_BASE}/appointments/available-slots`, {
      params: { doctorId, date }
    });

    console.log('RAW response:', res.data);

    const slots = res.data?.data?.availableSlots || [];
    console.log('Slots returned:', slots);

    slots.forEach((slot, i) => {
      const timeStr = typeof slot === 'string' ? slot : slot.time || '';
      const datetimeVN = slot.datetimeVN || slot.time || '';
      const formatted = dayjs(datetimeVN).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm');
      console.log(`${i + 1}. timeStr: ${timeStr}, datetimeVN: ${datetimeVN}, VN: ${formatted}`);
    });
  } catch (err) {
    console.error('Error fetching slots:', err.message);
  }
}

testAvailableSlots();
