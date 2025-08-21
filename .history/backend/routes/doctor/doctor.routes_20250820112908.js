const express = require('express');
const router = express.Router();
const doctorController = require('../../controllers/doctor/doctor.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

// ------------------------- Doctor Work Schedule -------------------------
router.get(
  '/work-schedule',
  verifyToken,
  authorize('doctor'),
  doctorController.getWorkSchedule
);

// ------------------------- Appointment Management -------------------------
router.patch(
  '/appointment/:id/status',
  verifyToken,
  authorize('doctor'),
  doctorController.updateAppointmentStatus
);

module.exports = router;

// // routes/doctor/doctor.routes.js
// const express = require('express');
// const router = express.Router();
// const doctorController = require('../../controllers/doctor/doctor.controller');
// const { verifyToken } = require('../../middlewares/auth/auth');
// const { authorize } = require('../../middlewares/auth/role');

// router.get('/work-schedule', verifyToken, authorize('doctor'), doctorController.getWorkSchedule);
// router.patch('/appointment/:id/status', verifyToken, authorize('doctor'), doctorController.updateAppointmentStatus);

// module.exports = router;
