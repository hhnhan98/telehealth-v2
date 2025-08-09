const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekday: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], required: true },
  timeSlots: [{ type: String }] 

module.exports = mongoose.model('Schedule', scheduleSchema);
