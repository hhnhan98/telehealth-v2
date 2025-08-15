const express = require('express');
const router = express.Router();
const {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment
} = require('../controllers/appointment.controller');

router.get('/locations', getLocations);
router.get('/specialties', getSpecialtiesByLocation);
router.get('/doctors', getDoctorsBySpecialtyAndLocation);
router.get('/available-slots', getAvailableSlots);
router.post('/create', createAppointment);

module.exports = router;
