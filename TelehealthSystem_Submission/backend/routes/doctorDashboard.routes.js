const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/doctorDashboard.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// ------------------------- Doctor Dashboard -------------------------
router.get(
  '/dashboard',
  verifyToken,
  authorize('doctor'),
  dashboardController.getDashboardData
);

module.exports = router;