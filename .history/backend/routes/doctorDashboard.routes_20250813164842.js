// routes/doctorDashboard.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { getDashboard } = require('../controllers/doctor.controller');

// Route chính trả toàn bộ dashboard bác sĩ
router.get('/', verifyToken, getDashboard);

module.exports = router;
