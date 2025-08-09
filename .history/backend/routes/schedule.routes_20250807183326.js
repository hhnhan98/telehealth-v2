const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middlewares/auth');
const { isDoctor } = require('../middlewares/role'); // Giả sử bạn tách role riêng, nếu không, xóa dòng này

const {
  getDoctorAvailableSlots,
  getDoctorWorkSchedule,
} = require('../controllers/schedule.controller');

// Lấy danh sách khung giờ rảnh của bác sĩ theo ngày
router.get('/available/:doctorId', verifyToken, getDoctorAvailableSlots);

// Lịch làm việc của bác sĩ (chỉ bác sĩ mới truy cập được)
router.get('/work-schedule', verifyToken, isDoctor, getDoctorWorkSchedule);

// Route chỉ cho admin
router.get('/admin-only', verifyToken, authorize('admin'), (req, res) => {
  res.json({ message: 'Chào admin!' });
});

module.exports = router;
