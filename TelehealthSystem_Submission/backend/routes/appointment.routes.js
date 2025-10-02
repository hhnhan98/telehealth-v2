const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const appointmentController = require('../controllers/appointment.controller');

// ========================= Dropdown APIs =========================
router.get('/locations', appointmentController.getLocations);
router.get('/specialties', appointmentController.getSpecialtiesByLocation);
router.get('/doctors', appointmentController.getDoctorsBySpecialtyAndLocation);
router.get('/available-slots', appointmentController.getAvailableSlots);

// ===================== Appointments (Patient perspective) =====================
// Tạo lịch hẹn mới
router.post('/', verifyToken, appointmentController.createAppointment);

// Xác thực OTP khi tạo lịch
router.post('/verify-otp', verifyToken, appointmentController.verifyOtp);

// Gửi lại OTP nếu cần
router.post('/resend-otp', verifyToken, appointmentController.resendOtpController);

// Lấy danh sách appointment của user hiện tại
router.get('/', verifyToken, appointmentController.getAppointments);

// Xem chi tiết 1 appointment của user
router.get('/:id', verifyToken, appointmentController.getAppointmentById);

// Hủy appointment của user
router.delete('/:id', verifyToken, appointmentController.cancelAppointment);

module.exports = router;
