const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  createAppointment,
  verifyOtp,
  getAppointmentHistory
} = require('../controllers/appointment.controller');

// Tạo lịch khám + gửi OTP
router.post('/', verifyToken, createAppointment);

// Xác thực OTP
router.post('/verify-otp', verifyToken, verifyOtp);

// Lấy lịch sử đặt lịch
router.get('/history', verifyToken, getAppointmentHistory);

module.exports = router;
