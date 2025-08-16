// routes/appointment/appointment.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth/auth');
const Appointment = require('../../models/Appointment');
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  verifyOtp,
  cancelAppointment
} = require('../../controllers/appointment/booking.controller');

// ===== Routes dropdown cho booking =====
router.get('/locations', getLocations);                             // DS cơ sở y tế
router.get('/specialties', getSpecialtiesByLocation);               // DS chuyên khoa theo location
router.get('/doctors', getDoctorsBySpecialtyAndLocation);           // DS bác sĩ theo location + specialty
router.get('/available-slots', getAvailableSlots);                  // Khung giờ khám trống

// ===== Routes quản lý lịch hẹn =====
router.post('/', verifyToken, createAppointment);                   // Tạo lịch hẹn + OTP
router.post('/verify-otp', verifyToken, verifyOtp);                 // Xác thực OTP
router.delete('/:id', verifyToken, cancelAppointment);              // Hủy lịch hẹn (confirmed)

// ===== Lấy danh sách lịch hẹn user hiện tại =====
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

module.exports = router;
