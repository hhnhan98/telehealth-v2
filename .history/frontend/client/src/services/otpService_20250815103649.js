// services/otpService.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OtpToken = require('../models/OtpToken');

const OTP_TTL_SECONDS = parseInt(process.env.OTP_TTL_SECONDS || '300', 10);
const OTP_RESEND_COOLDOWN = parseInt(process.env.OTP_RESEND_COOLDOWN || '60', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);

function generateOtp(length = 6) {
  // Tạo OTP số với padding
  const num = crypto.randomInt(0, 10 ** length);
  return num.toString().padStart(length, '0');
}

async function createOrResendOtp(contact, purpose = 'booking') {
  const now = new Date();
  const otp = generateOtp(6);
  const otpHash = await bcrypt.hash(otp, 10);

  let doc = await OtpToken.findOne({ contact, purpose });

  if (doc) {
    const diff = (now - doc.lastSentAt) / 1000;
    if (diff < OTP_RESEND_COOLDOWN) {
      const remain = Math.ceil(OTP_RESEND_COOLDOWN - diff);
      const err = new Error(`Chờ ${remain}s để gửi lại OTP.`);
      err.code = 'OTP_COOLDOWN';
      throw err;
    }
    doc.otpHash = otpHash;
    doc.expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000);
    doc.attempts = 0;
    doc.lastSentAt = now;
    await doc.save();
  } else {
    doc = await OtpToken.create({
      contact,
      purpose,
      otpHash,
      expiresAt: new Date(now.getTime() + OTP_TTL_SECONDS * 1000),
      lastSentAt: now,
    });
  }

  return { otp, expiresAt: doc.expiresAt };
}

async function verifyOtp(contact, otp, purpose = 'booking') {
  const doc = await OtpToken.findOne({ contact, purpose });
  if (!doc) {
    const err = new Error('OTP không tồn tại hoặc đã hết hạn.');
    err.code = 'OTP_NOT_FOUND';
    throw err;
  }

  if (doc.attempts >= OTP_MAX_ATTEMPTS) {
    await doc.deleteOne();
    const err = new Error('Bạn đã vượt quá số lần thử. Vui lòng gửi lại OTP.');
    err.code = 'OTP_ATTEMPTS_EXCEEDED';
    throw err;
  }

  const now = new Date();
  if (now > doc.expiresAt) {
    await doc.deleteOne();
    const err = new Error('OTP đã hết hạn. Vui lòng gửi lại OTP.');
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  const isMatch = await bcrypt.compare(otp, doc.otpHash);
  if (!isMatch) {
    doc.attempts += 1;
    await doc.save();
    const remain = OTP_MAX_ATTEMPTS - doc.attempts;
    const err = new Error(`OTP không đúng. Còn ${remain} lần thử.`);
    err.code = 'OTP_INCORRECT';
    throw err;
  }

  // Verified ← xóa token để tránh reuse
  await doc.deleteOne();
  return true;
}

module.exports = { createOrResendOtp, verifyOtp };
