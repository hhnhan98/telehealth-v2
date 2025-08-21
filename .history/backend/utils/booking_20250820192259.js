const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// ------------------------- OTP -------------------------
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ------------------------- Work Hours -------------------------
const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

// ------------------------- Helpers -------------------------
// Chuyển date + time VN sang UTC Date object
const convertToUTC = (dateStr, timeStr) =>
  dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh')
       .utc()
       .toDate();

module.exports = {
  generateOTP,
  WORK_HOURS,
  convertToUTC
};
