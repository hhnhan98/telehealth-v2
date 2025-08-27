// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');

// dayjs.extend(utc);
// dayjs.extend(timezone);

// // OTP 
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // Work Hours 
// // Khung giờ này cố định cho BE + FE
// const WORK_HOURS = [
//   '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
//   '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
// ];

// // Helpers
// // Chuyển date + time VN sang UTC Date object
// const convertToUTC = (dateStr, timeStr) =>
//   dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh')
//        .utc()
//        .toDate();

// module.exports = {
//   generateOTP,
//   WORK_HOURS,
//   convertToUTC
// };


const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// ---------------- OTP ----------------
/**
 * Sinh OTP 6 chữ số
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// = Work Hours ----------------
// Khung giờ cố định cho BE + FE
const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

// Helpers
// Chuyển date + time VN sang UTC Date object
const convertToUTC = (dateStr, timeStr) => {
  const dt = dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh');
  if (!dt.isValid()) throw new Error(`Invalid date/time: ${dateStr} ${timeStr}`);
  return dt.utc().toDate();
};

module.exports = {
  generateOTP,
  WORK_HOURS,
  convertToUTC
};
