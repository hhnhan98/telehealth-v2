const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth/auth');
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  verifyOtp
} = require('../../controllers/booking.controller');

// ----------------------
// Lấy dữ liệu dropdown
// ----------------------
router.get('/locations', getLocations);
router.get('/specialties', getSpecialtiesByLocation);
router.get('/doctors', getDoctorsBySpecialtyAndLocation);
router.get('/available-slots', getAvailableSlots);

// ----------------------
// Tạo lịch hẹn & xác thực OTP
// ----------------------
router.post('/', verifyToken, createAppointment);        // FE gọi /api/appointments/
router.post('/verify-otp', verifyToken, verifyOtp);      // FE gọi /api/appointments/verify-otp

module.exports = router;
