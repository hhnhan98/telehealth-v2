const express = require('express');
const router = express.Router();
const User = require('../models/User');

// [GET] /api/doctors?specialty=... → tìm bác sĩ theo chuyên khoa
router.get('/', async (req, res) => {
  try {
    const { specialty } = req.query;
    const query = { role: 'doctor' };

    if (specialty) {
      query.specialty = specialty;
    }

    const doctors = await User.find(query).populate('specialty', 'name');
    res.json(doctors);
  } catch (err) {
    console.error('Lỗi tìm bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server khi tìm bác sĩ' });
  }
});

// ✅ Route xem lịch làm việc của bác sĩ (ngày hoặc tuần)
router.get('/work-schedule', verifyToken, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Chỉ bác sĩ mới được phép truy cập' });
  }

  const view = req.query.view || 'day';

  try {
    const now = new Date();
    let startDate, endDate;

    if (view === 'week') {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    }

    const appointments = await Appointment.find({
      doctor: req.user.id,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' },
    }).sort({ date: 1 }).populate('patient', 'fullName email');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy lịch làm việc', details: err.message });
  }
});

module.exports = router;