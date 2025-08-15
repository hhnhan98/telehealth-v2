const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth');
const {
  getDashboardData,
  getWeeklySchedule
} = require('../controllers/doctorDashboard.controller');

// Dashboard tổng hợp
router.get('/', verifyToken, getDashboardData);

// Lấy lịch tuần
router.get('/weekly-schedule', verifyToken, getWeeklySchedule);

module.exports = router;
