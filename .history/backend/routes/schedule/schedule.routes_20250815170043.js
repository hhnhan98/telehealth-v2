const express = require('express');
const router = express.Router();

const { verifyToken } = require('../../middlewares/auth/auth');
const { isDoctor, authorize } = require('../../middlewares/role');
const scheduleController = require('../controllers/schedule.controller');

// Lấy khung giờ rảnh của bác sĩ theo ngày
router.get('/available/:doctorId', verifyToken, scheduleController.getDoctorAvailableSlots);

// Lịch làm việc của bác sĩ
router.get('/work-schedule', verifyToken, isDoctor, scheduleController.getDoctorWorkSchedule);

/* Chức năng chỉ dành cho admin (nếu có)
router.get('/admin-only', verifyToken, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin truy cập thành công!' });
});
*/

module.exports = router;
