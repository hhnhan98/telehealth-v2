const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  slots: [
    {
      time: String,        // ví dụ "08:00"
      isBooked: { type: Boolean, default: false },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
