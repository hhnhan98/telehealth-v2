// models/Schedule.js
const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // ví dụ: "08:00"
  isBooked: { type: Boolean, default: false } // slot đã được đặt chưa
});

const scheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  slots: [slotSchema]
});

module.exports = mongoose.model('Schedule', scheduleSchema);
