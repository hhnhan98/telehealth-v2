const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 📌 Đăng ký người dùng
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, specialty } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      specialty: role === 'doctor' ? specialty : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('❌ Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// ✅ Đăng nhập người dùng
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại' });
    }

    // 🔐 So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    // 🪙 Tạo token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // 🧾 Trả về token + thông tin người dùng
    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        specialty: user.specialty || null,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi khi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

module.exports = router;