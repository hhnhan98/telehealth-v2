const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  workScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkSchedule', // liên kết với ca làm việc
    required: false
  },
  paid: {
    type: Boolean,
    default: false // dùng cho giai đoạn thanh toán sau
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
