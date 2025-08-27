// services/schedule.service.js
const dayjs = require('dayjs');
const Schedule = require('../models/Schedule');
const { toUTC, toVN } = require('../utils/timezone');

const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

/**
 * Sinh ra danh sách slot theo ngày
 * - Chủ nhật nghỉ
 * - Thứ 7 chỉ sáng
 * - Thứ 2 → Thứ 6 full
 */
const generateTimeSlots = (date) => {
  const dayOfWeek = dayjs(date).day(); // 0=CN, 6=Sat
  if (dayOfWeek === 0) return [];
  if (dayOfWeek === 6) return WORK_HOURS.slice(0, 7);
  return WORK_HOURS;
};

/**
 * Tạo danh sách slot object
 * @param {string} date - ngày định dạng YYYY-MM-DD
 * @param {string[]} slotsArr - danh sách giờ (HH:mm)
 */
const createSlotObjects = (date, slotsArr) =>
  slotsArr.map(time => ({
    time,
    isBooked: false,
    datetimeUTC: toUTC(`${date} ${time}`) // chuẩn UTC để lưu DB
  }));

/**
 * Lấy lịch bác sĩ theo ngày hoặc tạo mới nếu chưa có
 */
const getOrCreateSchedule = async (doctorId, date) => {
  let schedule = await Schedule.findOne({ doctorId, date });
  if (!schedule) {
    const slots = createSlotObjects(date, generateTimeSlots(date));
    schedule = new Schedule({ doctorId, date, slots });
    await schedule.save();
  }
  return schedule;
};

/**
 * Đặt slot
 */
const bookSlot = async (doctorId, date, time) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  const slot = schedule.slots.find(s => s.time === time);
  if (!slot) throw new Error('Slot không tồn tại');
  if (slot.isBooked) throw new Error('Slot đã được đặt');

  slot.isBooked = true;
  await schedule.save();
  return schedule;
};

/**
 * Hủy slot
 */
const cancelSlot = async (doctorId, date, time) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  const slot = schedule.slots.find(s => s.time === time);
  if (!slot) throw new Error('Slot không tồn tại');

  slot.isBooked = false;
  await schedule.save();
  return schedule;
};

/**
 * Lấy danh sách slot trống
 */
const getAvailableSlots = async (doctorId, date) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  return schedule.slots
    .filter(s => !s.isBooked)
    .map(s => ({
      time: s.time,
      datetimeUTC: s
      datetimeVN: toVN(s.datetimeUTC)
    }));
};

module.exports = {
  WORK_HOURS,
  generateTimeSlots,
  createSlotObjects,
  getOrCreateSchedule,
  bookSlot,
  cancelSlot,
  getAvailableSlots
};
