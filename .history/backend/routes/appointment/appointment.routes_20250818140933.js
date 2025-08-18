const express = require('express');
const router = express.Router();
const { resendOtpController } = require('../../controllers/appointment/booking.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  getAppointments,
  verifyOtp,
  cancelAppointment
} = require('../../controllers/appointment/booking.controller');

// Routes lấy dữ liệu dropdown
router.get('/locations', getLocations);                         // Lấy danh sách cơ sở y tế
router.get('/specialties', getSpecialtiesByLocation);           // Lấy danh sách chuyên khoa theo cơ sở
router.get('/doctors', getDoctorsBySpecialtyAndLocation);       // Lấy danh sách bác sĩ theo chuyên khoa
router.get('/available-slots', getAvailableSlots);              // Lấy khung giờ trống

// Routes quản lý lịch hẹn
router.post('/', verifyToken, createAppointment);               // Tạo lịch hẹn mới
router.post('/verify-otp', verifyToken, verifyOtp);             // Xác thực OTP
router.post('/resend-otp', verifyToken, resendOtpController);   // Gửi lại mã OTP
router.delete('/:id', verifyToken, cancelAppointment);          // Hủy lịch hẹn
router.get('/', verifyToken, getAppointments);                  // Lấy danh sách lịch hẹn của user hiện tại

module.exports = router;
