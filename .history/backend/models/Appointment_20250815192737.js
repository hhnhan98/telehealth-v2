const mongoose = require('mongoose');

// Schema Appointment
const appointmentSchema = new mongoose.Schema({
  // Thông tin cơ bản về lịch hẹn
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location', 
    required: true 
  },
  specialty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Specialty', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Ngày và giờ khám
  date: { 
    type: String, // Format: YYYY-MM-DD
    required: true 
  },
  time: { 
    type: String, // Format: HH:mm
    required: true 
  },

  // Thông tin bệnh nhân
  patient: {
    fullName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true },
    reason: { type: String }
  },

  // OTP xác thực
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false },

  // Trạng thái lịch hẹn
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Liên kết với ca làm việc (WorkSchedule)
  workScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule', // Lưu reference đến ca làm việc của bác sĩ
    required: false
  },

  // Thanh toán online
  paid: {
    type: Boolean,
    default: false
  },

  // Thời điểm tạo
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index để tránh trùng lịch hẹn cùng bác sĩ + ngày + giờ
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
