const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');

const User = require('../models/User'); // ✅ Sửa lại từ Patient -> User

// Route lấy thông tin 1 bệnh nhân (role: patient) theo ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-password');
    if (!patient) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
    res.json(patient);
  } catch (err) {
    console.error('Lỗi khi lấy bệnh nhân:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route lấy tất cả bệnh nhân
router.get('/', verifyToken, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách bệnh nhân' });
  }
});

// Route tìm kiếm nhanh bệnh nhân theo tên/email
const { search } = req.query;
const query = { role: 'patient' };
if (search) {
  query.fullName = { $regex: search, $options: 'i' };
}

module.exports = router;