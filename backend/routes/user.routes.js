// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth'); // import đúng middleware có chứa verifyToken

// ✅ Route lấy danh sách tất cả bệnh nhân (chỉ dành cho bác sĩ hoặc admin)
router.get('/', auth.verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user.id);
    if (!requestingUser || (requestingUser.role !== 'doctor' && requestingUser.role !== 'admin')) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập danh sách bệnh nhân' });
    }

    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách bệnh nhân:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ✅ Route lấy thông tin cá nhân của người dùng hiện tại (đã login)
router.get('/me', auth.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    console.error('Lỗi khi lấy thông tin cá nhân:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ✅ Route lấy user theo ID (public)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    console.error('Lỗi khi lấy user theo ID:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ✅ Route tạo user mới
router.post('/', async (req, res) => {
  try {
    const { role, fullName, email, password } = req.body;
    const newUser = new User({ role, fullName, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Tạo user thành công', user: newUser });
  } catch (err) {
    console.error('Lỗi khi tạo user:', err);
    res.status(400).json({ error: 'Tạo user thất bại', details: err.message });
  }
});

// ✅ Route cập nhật user
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    if (!updatedUser) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json({ message: 'Cập nhật thành công', user: updatedUser });
  } catch (err) {
    console.error('Lỗi khi cập nhật user:', err);
    res.status(400).json({ error: 'Cập nhật thất bại', details: err.message });
  }
});

// ✅ Route xoá user
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json({ message: 'Đã xoá user' });
  } catch (err) {
    console.error('Lỗi khi xoá user:', err);
    res.status(500).json({ error: 'Xoá thất bại', details: err.message });
  }
});

module.exports = router;