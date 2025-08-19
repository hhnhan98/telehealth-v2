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
