// routes/doctor/doctor.routes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../../controllers/doctor/doctor.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

router.get('/work-schedule', verifyToken, authorize('doctor'), doctorController.getWeeklySchedule);
router.patch('/appointment/:id/status', verifyToken, authorize('doctor'), doctorController.updateAppointmentStatus);

module.exports = router;
