// routes/auth/otp.routes.js
const express = require('express');
const router = express.Router();

// Middleware xác thực token
const { verifyToken } = require('../../middlewares/auth/auth');

// Controller xử lý OTP
const { sendOtpForAppointment, verifyAppointmentOtp } = require('../../controllers/auth/otp.controller');

// ----------------------
// Gửi OTP sau khi tạo lịch hẹn
// POST /api/otp/send
// ----------------------
router.post('/send', verifyToken, sendOtpForAppointment);

// ----------------------
// Xác thực OTP
// POST /api/otp/verify
// ----------------------
router.post('/verify', verifyToken, verifyAppointmentOtp);

module.exports = router;
