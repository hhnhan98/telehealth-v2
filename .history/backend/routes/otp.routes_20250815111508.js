// routes/otp.routes.js
const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');

// Gửi OTP qua email
router.post('/send-otp', otpController.sendOTP);

// Xác minh OTP
router.post('/verify-otp', otpController.verifyOTP);

module.exports = router;
