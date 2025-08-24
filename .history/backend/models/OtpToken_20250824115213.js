/**
 * @swagger
 * components:
 *   schemas:
 *     OtpToken:
 *       type: object
 *       description: Mã OTP được tạo ra để xác thực (qua email hoặc số điện thoại)
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *           example: "64d7890abc123def456aaa11"
 *         contact:
 *           type: string
 *           description: Email hoặc số điện thoại của người nhận OTP
 *           example: "user@example.com"
 *         purpose:
 *           type: string
 *           description: Mục đích sử dụng OTP (ví dụ booking, register, reset-password)
 *           example: "booking"
 *         otpHash:
 *           type: string
 *           description: Hash của OTP (OTP gốc không được lưu thẳng)
 *           example: "$2b$10$abcdef..."
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian OTP hết hạn
 *           example: "2025-08-24T10:15:30.000Z"
 *         attempts:
 *           type: integer
 *           description: Số lần nhập OTP sai
 *           example: 2
 *         lastSentAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian OTP được gửi lần gần nhất (chống spam resend)
 *           example: "2025-08-24T09:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - contact
 *         - otpHash
 *         - expiresAt
 */
const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema(
  {
    contact: { 
      type: String, 
      required: [true, 'Số điện thoại hoặc email là bắt buộc'] 
    },
    purpose: { 
      type: String, 
      default: 'booking' 
    },
    otpHash: { 
      type: String, 
      required: [true, 'OTP hash là bắt buộc'] 
    },
    expiresAt: { 
      type: Date, 
      required: [true, 'Thời gian hết hạn là bắt buộc'] 
    },
    attempts: { 
      type: Number, 
      default: 0 // Số lần verify OTP
    },
    lastSentAt: { 
      type: Date, 
      default: Date.now // Chặn spam resend
    },
  },
  { 
    timestamps: true, 
    collection: 'otp_tokens' // tên collection rõ ràng
  }
);

// Index giúp đảm bảo một contact/purpose duy nhất
otpTokenSchema.index({ contact: 1, purpose: 1 }, { unique: true });

// TTL index tự xóa document khi expiresAt tới hạn
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpToken', otpTokenSchema);