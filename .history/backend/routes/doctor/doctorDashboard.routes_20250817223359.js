// routes/doctor/doctorDashboard.routes.js
const express = require('express');
const router = express.Router();
const { getTodayAppointments } = require('../../controllers/doctor/doctorDashboard.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

router.get('/dashboard', verifyToken, authorize('doctor'), getTodayAppointments);

module.exports = router;
