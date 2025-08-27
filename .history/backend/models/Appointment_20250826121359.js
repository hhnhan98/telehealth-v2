/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       description: Thông tin cuộc hẹn giữa bệnh nhân và bác sĩ
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *         location:
 *           type: string
 *           description: ID tham chiếu Location
 *           example: "64c123abc456def7890aaa12"
 *         specialty:
 *           type: string
 *           description: ID tham chiếu Specialty
 *           example: "64c123abc456def7890bbb34"
 *         doctor:
 *           type: string
 *           description: ID tham chiếu Doctor
 *           example: "64c123abc456def7890ccc56"
 *         patient:
 *           type: string
 *           description: ID tham chiếu User (role = patient)
 *           example: "64c123abc456def7890ddd78"
 *         datetime:
 *           type: string
 *           format: date-time
 *           description: Thời gian cuộc hẹn (UTC)
 *           example: "2025-08-24T08:00:00.000Z"
 *         date:
 *           type: string
 *           description: Ngày (giờ Việt Nam, auto từ datetime)
 *           example: "2025-08-24"
 *         time:
 *           type: string
 *           description: Giờ (giờ Việt Nam, auto từ datetime)
 *           example: "15:00"
 *         reason:
 *           type: string
 *           description: Lý do khám bệnh
 *           example: "Đau đầu kéo dài 3 ngày"
 *         otp:
 *           type: string
 *           description: OTP xác minh lịch hẹn
 *           example: "123456"
 *         otpExpiresAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm hết hạn OTP
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Trạng thái xác minh OTP
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           default: pending
 *           description: Trạng thái cuộc hẹn
 *         workScheduleId:
 *           type: string
 *           description: ID tham chiếu Schedule (lịch làm việc bác sĩ)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật
 *       required:
 *         - location
 *         - specialty
 *         - doctor
 *         - patient
 *         - datetime
 */

const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { toVN } = require('../utils/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const appointmentSchema = new mongoose.Schema(
  {
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    datetime: { 
      type: Date, 
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date(); // Không cho phếp quá khứ
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

// // Middleware: tự động set date/time khi update
// appointmentSchema.pre('findOneAndUpdate', function (next) {
//   const update = this.getUpdate();
//   if (update.datetime) {
//     const vnTime = toVN(update.datetime);
//     update.date = dayjs(vnTime).format('YYYY-MM-DD');
//     update.time = dayjs(vnTime).format('HH:mm');
//   }
//   next();
// });

module.exports = mongoose.model('Appointment', appointmentSchema);
