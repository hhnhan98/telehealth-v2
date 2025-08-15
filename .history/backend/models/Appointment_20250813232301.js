const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    // Thời gian hẹn khám
    date: {
      type: Date,
      required: true
    },

    // Lý do khám bệnh
    reason: {
      type: String,
      trim: true
    },

    // Người đặt lịch (bệnh nhân)
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Bác sĩ tiếp nhận lịch khám
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Trạng thái lịch hẹn
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },

    // Đã gửi nhắc nhở chưa (qua email/SMS)
    isReminderSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
