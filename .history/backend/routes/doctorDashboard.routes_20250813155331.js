const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const doctorDashboardController = require('../controllers/doctorDashboard.controller');

// Lấy dashboard bác sĩ
router.get('/appointments/today', verifyToken, doctorDashboardController.getTodayAppointments);
router.get('/patients/count', verifyToken, doctorDashboardController.getPatientsCount);
router.get('/medical-records/new', verifyToken, doctorDashboardController.getNewMedicalRecords);

module.exports = router;
