const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  datetime: { type: Date, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: '' }
  otp: String,
  otpExpiresAt: Date,
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  workScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
