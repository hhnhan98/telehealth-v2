// routes/schedule.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { getDoctorAvailableSlots } = require('../controllers/schedule.controller');

// Lấy danh sách khung giờ rảnh của bác sĩ theo ngày
// Ví dụ: GET /api/schedules/available/abc123?date=2025-08-10
router.get('/available/:doctorId', verifyToken, getDoctorAvailableSlots);

// Lịch làm việc của bác sĩ
router.get('/work-schedule', verifyToken, isDoctor, scheduleController.getDoctorWorkSchedule);

module.exports = router;
