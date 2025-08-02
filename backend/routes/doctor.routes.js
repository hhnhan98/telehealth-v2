const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Doctor = require('../models/Doctor');
const { getPatientsWithLastRecord } = require('../controllers/doctorController');

router.get('/', async (req, res) => {
  try {
    const { specialty } = req.query;
    const query = specialty ? { specialty } : {};

    const doctors = await Doctor.find(query).populate('specialty', 'name');
    res.json(doctors);
  } catch (err) {
    console.error('Lỗi tìm bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server khi tìm bác sĩ' });
  }
});

// Bảo vệ route bằng verifyToken
router.get('/patients', auth.verifyToken, getPatientsWithLastRecord);

module.exports = router;