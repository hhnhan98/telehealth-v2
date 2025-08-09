const express = require('express');
const router = express.Router();

const {
  verifyToken,
  authorize,
  isDoctor
} = require('../middlewares/auth');

const {
  getDoctorAvailableSlots,
  getDoctorWorkSchedule,
} = require('../controllers/schedule.controller');

// 👉 Lấy khung giờ rảnh của bác sĩ theo ngày
router.get('/available/:doctorId', verifyToken, getDoctorAvailableSlots);

// 👉 Lịch làm việc bác sĩ (chỉ cho bác sĩ xem)
router.get('/work-schedule', verifyToken, isDoctor, getDoctorWorkSchedule);

// 👉 Ví dụ route chỉ cho admin (tuỳ bạn dùng hay xóa)
router.get('/admin-only', verifyToken, authorize('admin'), (req, res) => {
  res.json({ message: 'Chào admin!' });
});

module.exports = router;
