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