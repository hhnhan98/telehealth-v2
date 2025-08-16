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

router.get('/locations', getLocations);
router.get('/specialties', getSpecialtiesByLocation);
router.get('/doctors', getDoctorsBySpecialtyAndLocation);
router.get('/available-slots', getAvailableSlots);

router.post('/', verifyToken, createAppointment);
router.post('/verify-otp', verifyToken, verifyOtp);
router.delete('/:id', verifyToken, cancelAppointment);

// Lấy danh sách lịch hẹn user hiện tại
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await require('../../models/Appointment').find({ 'patient._id': userId })
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .sort({ date: 1, time: 1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
