// services/schedule.service.js
const Schedule = require('../models/Schedule');
const Appointment = require('../')
const { toUTC, toVN, formatVN } = require('../utils/timezone');
const dayjs = require('dayjs');

const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

const getAvailableSlots = async (doctorId, date) => {
  // 1. Sinh tất cả khung giờ của ngày
  const allSlots = WORK_HOURS;

  // 2. Lấy tất cả Appointment của bác sĩ vào ngày đó
  const startOfDay = dayjs(date).startOf('day').toDate();
  const endOfDay = dayjs(date).endOf('day').toDate();

  const appointments = await Appointment.find({
    doctor: doctorId,
    datetime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] } // chỉ tính những slot đã đặt
  }).lean();

  // 3. Lấy danh sách giờ đã được đặt
  const bookedTimes = appointments.map(a => dayjs(a.datetime).format('HH:mm'));

  // 4. Lọc các slot còn trống
  const availableSlots = allSlots
    .filter(time => !bookedTimes.includes(time))
    .map(time => {
      const datetimeUTC = toUTC(`${date} ${time}`);
      return {
        time,
        datetimeUTC,
        datetimeVN: formatVN(datetimeUTC)
      };
    });

  return availableSlots;
};

// Sinh ra danh sách slot theo ngày
const generateTimeSlots = (date) => {
  const dayOfWeek = dayjs(date).day(); // 0=CN, 6=Sat
  if (dayOfWeek === 0) return [];
  if (dayOfWeek === 6) return WORK_HOURS.slice(0, 7);
  return WORK_HOURS;
};

// Tạo danh sách slot object
const createSlotObjects = (date, slotsArr) =>
  slotsArr.map(time => ({
    time,
    isBooked: false,
    datetimeUTC: toUTC(`${date} ${time}`) // chuẩn UTC để lưu DB
  }));

// Lấy lịch bác sĩ theo ngày hoặc tạo mới nếu chưa có
const getOrCreateSchedule = async (doctorId, date) => {
  let schedule = await Schedule.findOne({ doctorId, date });
  if (!schedule) {
    const slots = createSlotObjects(date, generateTimeSlots(date));
    schedule = new Schedule({ doctorId, date, slots });
    await schedule.save();
  }
  return schedule;
};

// Đặt slot
const bookSlot = async (doctorId, date, time) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  const slot = schedule.slots.find(s => s.time === time);
  if (!slot) throw new Error('Slot không tồn tại');
  if (slot.isBooked) throw new Error('Slot đã được đặt');

  slot.isBooked = true;
  await schedule.save();
  return schedule;
};

// Hủy slot
const cancelSlot = async (doctorId, date, time) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  const slot = schedule.slots.find(s => s.time === time);
  if (!slot) throw new Error('Slot không tồn tại');

  slot.isBooked = false;
  await schedule.save();
  return schedule;
};

// // Lấy danh sách slot trống
// const getAvailableSlots = async (doctorId, date) => {
//   const schedule = await getOrCreateSchedule(doctorId, date);

//   return schedule.slots
//     .filter(s => !s.isBooked)
//     .map(s => {
//       // Nếu datetimeUTC chưa tồn tại thì tạo từ date + time
//       if (!s.datetimeUTC) {
//         s.datetimeUTC = toUTC(`${date} ${s.time}`);
//       }
//       return {
//         time: s.time,
//         datetimeUTC: s.datetimeUTC,
//         datetimeVN: formatVN(s.datetimeUTC)
//       };
//     });
// };

module.exports = {
  WORK_HOURS,
  getAvailableSlots,
  generateTimeSlots,
  createSlotObjects,
  getOrCreateSchedule,
  bookSlot,
  cancelSlot
};
