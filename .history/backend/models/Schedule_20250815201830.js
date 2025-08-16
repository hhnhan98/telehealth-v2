const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  time: String,            // ví dụ: "08:00"
  isBooked: { type: Boolean, default: false }
});

const scheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  slots: [slotSchema]
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
