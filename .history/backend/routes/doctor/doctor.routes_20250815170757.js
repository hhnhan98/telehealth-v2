// routes/doctor/doctor.routes.js
const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const doctorController = require('../../controllers/doctor/doctor.controller');

// Middleware xác thực và phân quyền
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

/**
 * [GET] /api/doctors?specialty=...
 * Lấy danh sách bác sĩ theo chuyên khoa
 */
router.get('/', async (req, res) => {
  try {
    const { specialty } = req.query;
    const query = { role: 'doctor' };
    if (specialty) query.specialty = specialty;

    const doctors = await User.find(query).populate('specialty', 'name');
    res.json(doctors);
  } catch (err) {
    console.error('❌ Lỗi tìm bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server khi tìm bác sĩ' });
  }
});

/**
 * [GET] /api/doctors/work-schedule?view=day|week
 * Xem lịch làm việc của bác sĩ theo ngày hoặc tuần
 * Chỉ bác sĩ mới xem được lịch của chính mình
 */
router.get('/work-schedule', verifyToken, authorize('doctor'), async (req, res) => {
  try {
    const view = req.query.view || 'day';
    const now = new Date();
    let startDate, endDate;

    if (view === 'week') {
      const dayOfWeek = now.getDay(); // 0: Chủ nhật
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // tổng 7 ngày
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    }

    const appointments = await Appointment.find({
      doctor: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' },
    })
      .sort({ date: 1 })
      .populate('patient', 'fullName email');

    res.json(appointments);
  } catch (err) {
    console.error('❌ Lỗi lấy lịch làm việc:', err);
    res.status(500).json({ error: 'Lỗi khi lấy lịch làm việc', details: err.message });
  }
});

/**
 * [GET] /api/doctors/dashboard
 * Lấy dữ liệu dashboard bác sĩ
 */
router.get('/dashboard', verifyToken, authorize('doctor'), doctorController.getDashboard);

module.exports = router;
