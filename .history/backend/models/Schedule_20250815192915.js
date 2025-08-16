const mongoose = require('mongoose');

// Slot giờ trong ngày của bác sĩ
const timeSlotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // ví dụ: "08:00", "09:00"
  isBooked: { type: Boolean, default: false } // true nếu đã có appointment
});

const scheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // ISO date string: YYYY-MM-DD
  slots: [timeSlotSchema] // mảng các slot trong ngày
}, { timestamps: true });

// Một bác sĩ chỉ có 1 lịch làm việc cho mỗi ngày
scheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
