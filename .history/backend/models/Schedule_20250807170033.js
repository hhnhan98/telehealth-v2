const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlots: [{ type: String }]
});

module.exports = mongoose.model('Schedule', scheduleSchema);
