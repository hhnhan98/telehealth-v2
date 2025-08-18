const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // --- datetime chuẩn UTC ---
  datetime: { type: Date, required: true },

  // --- optional: lưu lại date/time string để hiển thị ---
  date: { type: String }, 
  time: { type: String },

  reason: { type: String, default: '' },
  otp: String,
  otpExpiresAt: Date,
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  workScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
}, { timestamps: true });

// --- Middleware: auto set date/time string từ datetime ---
appointmentSchema.pre('save', function (next) {
  if (this.datetime) {
    const dt = new Date(this.datetime);
    const vnOffset = 7 * 60; // +7 giờ VN
    const vnTime = new Date(dt.getTime() + vnOffset * 60000);

    this.date = vnTime.toISOString().split('T')[0]; // YYYY-MM-DD VN
    this.time = vnTime.toTimeString().slice(0, 5);   // HH:mm VN
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
