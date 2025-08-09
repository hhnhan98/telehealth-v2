const express = require('express');
const router = express.Router();
const Specialty = require('../models/Specialty');

router.get('/', async (req, res) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ message: 'Không thể lấy danh sách chuyên khoa' });
  }
});

module.exports = router;