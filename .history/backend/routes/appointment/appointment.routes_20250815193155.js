const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth/auth');
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  verifyOtp,
  cancelAppointment
} = require('../../controllers/appointment/booking.controller');

// ----------------------
// Lấy dữ liệu dropdown cho booking
// ----------------------
router.get('/locations', getLocations);
router.get('/specialties', getSpecialtiesByLocation);
router.get('/doctors', getDoctorsBySpecialtyAndLocation);
router.get('/available-slots', getAvailableSlots);

// ----------------------
// Tạo lịch hẹn + xác thực OTP
// ----------------------
router.post('/', verifyToken, createAppointment);        // Tạo lịch hẹn
router.post('/verify-otp', verifyToken, verifyOtp);      // Xác thực OTP

// ----------------------
// Hủy lịch hẹn
// ----------------------
router.post('/cancel', verifyToken, cancelAppointment);  // Hủy appointment

// ----------------------
// Sau này có thể thêm:
// - /reschedule -> đổi slot + update workScheduleId
// - /doctor/:doctorId -> lấy lịch bác sĩ
// - /user/:userId -> lấy lịch bệnh nhân
// ----------------------

module.exports = router;
