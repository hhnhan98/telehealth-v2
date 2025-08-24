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

// // models/OtpToken.js
// const mongoose = require('mongoose');

// const otpTokenSchema = new mongoose.Schema({
//   contact: { type: String, required: true }, // phone hoặc email
//   purpose: { type: String, default: 'booking' },
//   otpHash: { type: String, required: true },
//   expiresAt: { type: Date, required: true },
//   attempts: { type: Number, default: 0 },           // số lần verify
//   lastSentAt: { type: Date, default: Date.now },    // chặn spam resend
// }, { timestamps: true });

// otpTokenSchema.index({ contact: 1, purpose: 1 }, { unique: true });
// otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 
// // TTL index: tự xóa document sau khi hết hạn

// module.exports = mongoose.model('OtpToken', otpTokenSchema);
