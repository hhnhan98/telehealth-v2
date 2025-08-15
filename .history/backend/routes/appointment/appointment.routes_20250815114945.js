// routes/appointment.routes.js

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  verifyOtp
} = require('../controllers/appointment.controller');

// ----------------------
// Danh sách cơ sở y tế
router.get('/locations', verifyToken, getLocations);

// ----------------------
// Danh sách chuyên khoa theo location
router.get('/specialties', verifyToken, getSpecialtiesByLocation);

// ----------------------
// Danh sách bác sĩ theo location + specialty
router.get('/doctors', verifyToken, getDoctorsBySpecialtyAndLocation);

// ----------------------
// Giờ khám trống
router.get('/available-slots', verifyToken, getAvailableSlots);

// ----------------------
// Tạo lịch hẹn (sinh OTP, gửi email)
router.post('/create', verifyToken, createAppointment);

// ----------------------
// Xác thực OTP sau khi đặt lịch
router.post('/verify-otp', verifyToken, verifyOtp);

module.exports = router;
