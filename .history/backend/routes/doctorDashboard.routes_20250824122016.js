/**
 * @swagger
 * tags:
 *   name: DoctorDashboard
 *   description: API thống kê dữ liệu dành cho bác sĩ
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/doctorDashboard.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

/**
 * @swagger
 * /api/doctors/dashboard:
 *   get:
 *     summary: Lấy dữ liệu tổng quan của bác sĩ (Dashboard)
 *     description: Trả về thống kê lịch hẹn, bệnh nhân và các dữ liệu liên quan trong dashboard của bác sĩ.
 *     tags: [DoctorDashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu dashboard được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAppointments:
 *                   type: integer
 *                   example: 12
 *                 upcomingAppointments:
 *                   type: integer
 *                   example: 3
 *                 completedAppointments:
 *                   type: integer
 *                   example: 8
 *                 cancelledAppointments:
 *                   type: integer
 *                   example: 1
 *                 patients:
 *                   type: integer
 *                   example: 10
 *       401:
 *         description: Chưa được xác thực hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập (chỉ dành cho bác sĩ)
 */
router.get(
  '/dashboard',
  verifyToken,
  authorize('doctor'),
  dashboardController.getDashboardData
);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const dashboardController = require('../controllers/doctorDashboard.controller');
// const { verifyToken } = require('../middlewares/auth');
// const { authorize } = require('../middlewares/role');

// // ------------------------- Doctor Dashboard -------------------------
// router.get(
//   '/dashboard',
//   verifyToken,
//   authorize('doctor'),
//   dashboardController.getDashboardData
// );

// module.exports = router;