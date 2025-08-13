const express = require('express');
const router = express.Router();
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots
} = require('../controllers/booking.controller');

// API lấy danh sách địa điểm
router.get('/locations', getLocations);

// API lấy danh sách chuyên khoa theo địa điểm
router.get('/specialties', getSpecialtiesByLocation);

// API lấy danh sách bác sĩ theo chuyên khoa + địa điểm
router.get('/doctors', getDoctorsBySpecialtyAndLocation);

// API lấy khung giờ trống của bác sĩ
router.get('/available-slots', getAvailableSlots);

module.exports = router;
