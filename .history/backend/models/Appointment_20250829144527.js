const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { toVN } = require('../utils/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'expired'];

const appointmentSchema = new mongoose.Schema(
  {
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    datetime: { 
      type: Date, 
      required: true,
      validate: {
        validator: function (value) {
          if (!this.isNew && !this.isModified('datetime')) return true;  // nếu không phải tạo mới và không sửa datetime thì bỏ validate
          return value && value > new Date();
        },
        message: 'Không thể đặt lịch ở thời điểm quá khứ'
      }
    },

    // Auto hiển thị giờ VN
    date: { type: String },
    time: { type: String },

    reason: { type: String, default: '' },

    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },

    status: { type: String, enum: APPOINTMENT_STATUSES, default: 'pending' },

    workScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  },
  { timestamps: true }
);

// Middleware: tự động set date/time string VN khi lưu
appointmentSchema.pre('save', function (next) {
  if (this.isModified('datetime') && this.datetime) {
    const vnTime = toVN(this.datetime);
    this.date = dayjs(vnTime).format('YYYY-MM-DD');
    this.time = dayjs(vnTime).format('HH:mm');
  }
  next();
});

// Middleware: validate + tự động set date/time khi update
appointmentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.datetime) {
    // Kiểm tra không cho phép update về quá khứ
    if (update.datetime < new Date()) {
      return next(new Error('Không thể đặt lịch ở thời điểm quá khứ'));
    }

    // Auto set date/time VN
    const vnTime = toVN(update.datetime);
    update.date = dayjs(vnTime).format('YYYY-MM-DD');
    update.time = dayjs(vnTime).format('HH:mm');
  }

  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
