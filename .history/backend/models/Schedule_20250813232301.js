const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // ví dụ: "08:00", "09:00"
  isBooked: { type: Boolean, default: false }
});

const scheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // ISO date string (yyyy-mm-dd)
    required: true
  },
  slots: [timeSlotSchema]
}, {
  timestamps: true
});

// Một bác sĩ chỉ có 1 lịch làm việc cho mỗi ngày
scheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
