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

module.exports = router;