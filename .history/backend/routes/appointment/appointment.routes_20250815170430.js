// routes/appointment.routes.js

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth/auth'); // sửa đường dẫn nếu cần
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  verifyOtp
} = require('../../controllers/appointment/appointment.controller');

// ----------------------
// Lấy danh sách cơ sở y tế
router.get('/locations', verifyToken, getLocations);

// ----------------------
// Lấy danh sách chuyên khoa theo cơ sở y tế (location)
router.get('/specialties', verifyToken, getSpecialtiesByLocation);

// ----------------------
// Lấy danh sách bác sĩ theo location + specialty
router.get('/doctors', verifyToken, getDoctorsBySpecialtyAndLocation);

// ----------------------
// Lấy danh sách giờ khám trống
router.get('/available-slots', verifyToken, getAvailableSlots);

// ----------------------
// Tạo lịch hẹn (POST /api/appointments/)
router.post('/', verifyToken, createAppointment);

// ----------------------
// Xác thực OTP sau khi đặt lịch
router.post('/verify-otp', verifyToken, verifyOtp);

module.exports = router;
