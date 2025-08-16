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

/**
 * ----------------------
 * Routes lấy dữ liệu dropdown cho booking
 * ----------------------
 */

// Lấy danh sách cơ sở y tế
router.get('/locations', getLocations);

// Lấy danh sách chuyên khoa theo location
router.get('/specialties', getSpecialtiesByLocation);

// Lấy danh sách bác sĩ theo location + specialty
router.get('/doctors', getDoctorsBySpecialtyAndLocation);

// Lấy khung giờ khám trống của bác sĩ theo ngày
router.get('/available-slots', getAvailableSlots);

// *** Routes quản lý lịch hẹn ***

// Tạo lịch hẹn + gửi OTP
router.post('/', verifyToken, createAppointment);

// Xác thực OTP lịch hẹn
router.post('/verify-otp', verifyToken, verifyOtp);

// Hủy lịch hẹn theo appointmentId (chỉ bác sĩ/bệnh nhân đã xác thực)
router.delete('/:id', verifyToken, cancelAppointment);

// Lấy danh sách lịch hẹn của user hiện tại
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.find({ 'patient._id': userId })
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ----------------------
 * Lưu ý mở rộng trong tương lai:
 * - /reschedule -> đổi slot + update workScheduleId
 * - /doctor/:doctorId -> lấy lịch bác sĩ
 * - /user/:userId -> lấy lịch bệnh nhân
 * ----------------------
 */

module.exports = router;
