const dayjs = require('dayjs');
const Schedule = require('../models/Schedule');

const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

const generateTimeSlots = (date) => {
  const dayOfWeek = dayjs(date).day(); // 0=CN, 6=Sat
  if (dayOfWeek === 0) return []; // Chủ nhật nghỉ
  if (dayOfWeek === 6) return WORK_HOURS.slice(0,7); // Thứ 7 chỉ sáng
  return WORK_HOURS; // T2-T6 full
};

const getOrCreateSchedule = async (doctorId, date) => {
  let schedule = await Schedule.findOne({ doctorId, date });
  if (!schedule) {
    const slots = generateTimeSlots(date).map(t => ({ time: t, isBooked: false }));
    schedule = new Schedule({ doctorId, date, slots });
    await schedule.save();
  }
  return schedule;
};

const bookSlot = async (doctorId, date, time) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  const slot = schedule.slots.find(s => s.time === time);
  if (!slot) throw new Error('Slot không tồn tại');
  if (slot.isBooked) throw new Error('Slot đã được đặt');
  slot.isBooked = true;
  await schedule.save();
  return schedule;
};

const cancelSlot = async (doctorId, date, time) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  const slot = schedule.slots.find(s => s.time === time);
  if (!slot) throw new Error('Slot không tồn tại');
  slot.isBooked = false;
  await schedule.save();
  return schedule;
};

const getAvailableSlots = async (doctorId, date) => {
  const schedule = await getOrCreateSchedule(doctorId, date);
  return schedule.slots.filter(s => !s.isBooked).map(s => s.time);
};

module.exports = {
  generateTimeSlots,
  getOrCreateSchedule,
  bookSlot,
  cancelSlot,
  getAvailableSlots
};
