const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/doctorDashboard.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

// ------------------------- Doctor Dashboard -------------------------
router.get(
  '/dashboard',
  verifyToken,
  authorize('doctor'),
  dashboardController.getDashboardData
);

module.exports = router;

// routes/doctor/doctorDashboard.routes.js
// const express = require('express');
// const router = express.Router();
// const dashboardController = require('../../controllers/doctor/doctorDashboard.controller');
// const { verifyToken } = require('../../middlewares/auth/auth');
// const { authorize } = require('../../middlewares/auth/role');

// router.get('/dashboard', verifyToken, authorize('doctor'), dashboardController.getDashboardData);

// module.exports = router;
