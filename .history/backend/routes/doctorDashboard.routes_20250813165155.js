const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');

// Dashboard controller
const {
  getDashboardData
} = require('../controllers/doctorDashboard.controller');

// Route duy nhất trả dashboard bác sĩ
router.get('/', verifyToken, getDashboardData);

module.exports = router;
