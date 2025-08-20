const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth/auth');
const bookingController = require('../../controllers/appointment/booking.controller');

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

// const express = require('express');
// const router = express.Router();
// const { resendOtpController } = require('../../controllers/appointment/booking.controller');
// const { verifyToken } = require('../../middlewares/auth/auth');
// const {
//   getLocations,
//   getSpecialtiesByLocation,
//   getDoctorsBySpecialtyAndLocation,
//   getAvailableSlots,
//   createAppointment,
//   getAppointments,
//   verifyOtp,
//   cancelAppointment
// } = require('../../controllers/appointment/booking.controller');

// // Routes lấy dữ liệu dropdown
// router.get('/locations', getLocations);                         // Lấy danh sách cơ sở y tế
// router.get('/specialties', getSpecialtiesByLocation);           // Lấy danh sách chuyên khoa theo cơ sở
// router.get('/doctors', getDoctorsBySpecialtyAndLocation);       // Lấy danh sách bác sĩ theo chuyên khoa
// router.get('/available-slots', getAvailableSlots);              // Lấy khung giờ trống

// // Routes quản lý lịch hẹn
// router.post('/', verifyToken, createAppointment);               // Tạo lịch hẹn mới
// router.post('/verify-otp', verifyToken, verifyOtp);             // Xác thực OTP
// router.post('/resend-otp', verifyToken, resendOtpController);   // Gửi lại mã OTP
// router.delete('/:id', verifyToken, cancelAppointment);          // Hủy lịch hẹn
// router.get('/', verifyToken, getAppointments);                  // Lấy danh sách lịch hẹn của user hiện tại

// module.exports = router;
