const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const bookingController = require('../../controllers/booking.controller');

// ========================= Dropdown APIs =========================
// Lấy danh sách cơ sở
router.get('/locations', bookingController.getLocations);

// Lấy danh sách chuyên khoa theo cơ sở
router.get('/specialties', bookingController.getSpecialtiesByLocation);

// Lấy danh sách bác sĩ theo chuyên khoa và cơ sở
router.get('/doctors', bookingController.getDoctorsBySpecialtyAndLocation);

// Lấy khung giờ trống của bác sĩ
router.get('/available-slots', bookingController.getAvailableSlots);

// ===================== Appointment Management =====================
// Tạo lịch hẹn mới (bắt buộc login)
router.post('/', verifyToken, bookingController.createAppointment);

// Xác thực OTP khi tạo lịch
router.post('/verify-otp', verifyToken, bookingController.verifyOtp);

// Gửi lại OTP nếu cần
router.post('/resend-otp', verifyToken, bookingController.resendOtpController);

// Hủy lịch hẹn theo ID
router.delete('/:id', verifyToken, bookingController.cancelAppointment);

// Lấy danh sách lịch hẹn của user hiện tại
router.get('/', verifyToken, bookingController.getAppointments);

module.exports = router;