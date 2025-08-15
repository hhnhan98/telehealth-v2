// routes/schedule/schedule.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth/auth');
const { isDoctor, authorize } = require('../../middlewares/auth/role');
const scheduleController = require('../../controllers/schedule/schedule.controller');

/**
 * [GET] /api/schedule/available/:doctorId
 * Lấy khung giờ rảnh của bác sĩ theo ngày
 * Quyền: tất cả người dùng đã đăng nhập
 */
router.get('/available/:doctorId', verifyToken, scheduleController.getDoctorAvailableSlots);

/**
 * [GET] /api/schedule/work-schedule
 * Lấy lịch làm việc của bác sĩ (ngày hoặc tuần)
 * Quyền: chỉ bác sĩ
 */
router.get('/work-schedule', verifyToken, isDoctor, scheduleController.getDoctorWorkSchedule);

/* Ví dụ chức năng chỉ dành cho admin
router.get('/admin-only', verifyToken, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin truy cập thành công!' });
});
*/

module.exports = router;
