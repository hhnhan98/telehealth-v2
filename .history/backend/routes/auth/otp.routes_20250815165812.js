const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth/auth');
const { sendOtpForAppointment, verifyAppointmentOtp } = require('../controllers/otp.controller');

// Gửi OTP sau khi tạo lịch
router.post('/send', verifyToken, sendOtpForAppointment);

// Xác thực OTP
router.post('/verify', verifyToken, verifyAppointmentOtp);

module.exports = router;
