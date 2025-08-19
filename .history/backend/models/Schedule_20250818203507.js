const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // "08:00"
  isBooked: { type: Boolean, default: false }
});

const ScheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  slots: [SlotSchema]
}, { timestamps: true });

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
