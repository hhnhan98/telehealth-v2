const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  getLocations,
  getSpecialties,
  getDoctorsBySpecialtyAndLocation,
  getAvailableTimes,
  createAppointment
} = require('../controllers/appointment.controller');

// Danh sách cơ sở y tế
router.get('/locations', verifyToken, getLocations);

// Danh sách chuyên khoa
router.get('/specialties', verifyToken, getSpecialties);

// Danh sách bác sĩ theo chuyên khoa
router.get('/doctors', verifyToken, getDoctorsBySpecialtyAndLocation);

// Giờ trống của bác sĩ
router.get('/available', verifyToken, getAvailableTimes);

// Tạo lịch khám
router.post('/', verifyToken, createAppointment);

module.exports = router;
