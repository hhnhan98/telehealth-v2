const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { verifyToken } = require('../../middlewares/auth/auth');
const Appointment = require('../../models/Appointment');
const bookingController = re
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
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
router.delete('/:id', verifyToken, cancelAppointment);          // Hủy lịch hẹn
router.get('/appointments', verifyToken, bookingController.getAppointments);

// Lấy danh sách lịch hẹn của user hiện tại
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'User ID không hợp lệ' });
    }

    const appointments = await Appointment.find({ 'patient._id': userId })
      .populate('doctor', 'fullName')           // Lấy tên bác sĩ
      .populate('specialty', 'name')            // Lấy tên chuyên khoa
        .populate('location', 'name')             // Lấy tên cơ sở
      .sort({ date: 1, time: 1 });              // Sắp xếp thời gian (theo ngày + giờ)

    res.json({ appointments });
  } catch (err) {
    console.error("Error in GET /appointments:", err);
    res.status(500).json({ error: 'Lỗi load lịch hẹn', details: err.message });
  }
});

module.exports = router;
