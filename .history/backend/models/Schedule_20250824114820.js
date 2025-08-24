const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: [true, 'Thời gian slot là bắt buộc'], // ví dụ "08:00"
    match: [/^\d{2}:\d{2}$/, 'Định dạng thời gian không hợp lệ'],
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
}, { _id: false }); // không cần _id riêng cho slot

const ScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'doctorId là bắt buộc'],
  },
  date: {
    type: String,
    required: [true, 'Ngày là bắt buộc'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày phải là YYYY-MM-DD'],
  },
  slots: {
    type: [SlotSchema],
    default: [],
  },
}, { timestamps: true });

// Đảm bảo mỗi doctor chỉ có 1 schedule cho 1 ngày
ScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);

// // models/Schedule.js
// const mongoose = require('mongoose');

// const slotSchema = new mongoose.Schema({
//   time: { type: String, required: true }, // ví dụ: "08:00"
//   isBooked: { type: Boolean, default: false } // slot đã được đặt chưa
// });

// const scheduleSchema = new mongoose.Schema({
//   doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
//   date: { type: String, required: true }, // YYYY-MM-DD
//   slots: [slotSchema]
// });

// module.exports = mongoose.model('Schedule', scheduleSchema);