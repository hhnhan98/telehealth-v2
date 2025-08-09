const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  isReminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
