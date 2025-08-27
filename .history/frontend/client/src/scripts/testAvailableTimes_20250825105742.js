// src/utils/testAvailableTimes.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

// Chuyển UTC sang VN string
const formatVN = (date, format = 'YYYY-MM-DD HH:mm') => {
  return dayjs(date).tz(DEFAULT_TZ).format(format);
};

// Giả lập dữ liệu từ backend
const availableTimes = [
  { time: '08:00', datetime: '2025-08-25T01:00:00.000Z' },
  { time: '08:30', datetime: '2025-08-25T01:30:00.000Z' },
  { time: '09:00', datetime: 'invalid-date' },  // Test case xấu
];

availableTimes.forEach((slot, index) => {
  console.log(`Slot ${index}`);
  console.log('Original datetime:', slot.datetime);
  
  const dateObj = new Date(slot.datetime);
  console.log('JS Date object:', dateObj);

  try {
    const vn = formatVN(slot.datetime, 'HH:mm');
    console.log('VN formatted:', vn);
  } catch (err) {
    console.error('Error formatting VN date:', err.message);
  }

  console.log('---');
});