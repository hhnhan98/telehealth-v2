const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },  // ✅ đổi từ weekday sang date

});

module.exports = mongoose.model('Schedule', scheduleSchema);
