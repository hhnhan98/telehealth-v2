// routes/doctor/doctorDashboard.routes.js
const express = require('express');
const router = express.Router();

// Middleware xác thực
const { verifyToken } = require('../../middlewares/auth/auth');

// Controller
const {
  getDashboardData,
  getWeeklySchedule
} = require('../../controllers/doctor/doctorDashboard.controller');

/**
 * [GET] /api/doctor-dashboard/
 * Lấy dữ liệu dashboard tổng hợp cho bác sĩ
 * Yêu cầu xác thực
 */
router.get('/', verifyToken, getDashboardData);

/**
 * [GET] /api/doctor-dashboard/weekly-schedule
 * Lấy lịch làm việc tuần hiện tại của bác sĩ
 * Yêu cầu xác thực
 */
router.get('/weekly-schedule', verifyToken, getWeeklySchedule);

module.exports = router;
