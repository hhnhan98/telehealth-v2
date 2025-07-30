const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateJWT = require('../middlewares/authenticateJWT');

// ✅ Route lấy danh sách tất cả người dùng (admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ✅ Route lấy thông tin cá nhân của người dùng hiện tại (đã login)
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ✅ Route lấy user theo ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
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
    res.status(500).json({ error: 'Xoá thất bại', details: err.message });
  }
});

module.exports = router;