const express = require('express');
const router = express.Router();
const Specialty = require('../models/Specialty');

// GET all specialties
router.get('/', async (req, res) => {
  try {
    const specialties = await Specialty.find();
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;