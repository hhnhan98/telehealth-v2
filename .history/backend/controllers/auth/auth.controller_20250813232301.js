const User = require('../models/User');
const Specialty = require('../models/Specialty');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// [POST] /api/auth/register
exports.register = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty } = req.body;

    if (!role || !fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (role === 'doctor' && !specialty) {
      return res.status(400).json({ message: 'Bác sĩ cần chọn chuyên khoa' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let specialtyId = null;
    let specialtyName = null;

    if (role === 'doctor') {
      const foundSpecialty = await Specialty.findById(specialty);
      if (!foundSpecialty) {
        return res.status(400).json({ message: 'Chuyên khoa không hợp lệ' });
      }
      specialtyId = foundSpecialty._id;
      specialtyName = foundSpecialty.name;
    }
    
    const newUser = new User({
      role,
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      ...(role === 'doctor' && { specialty: specialtyId })
    });

    await newUser.save();

    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        specialty: specialtyName || null
      }
    });
  } catch (error) {
    console.error('Lỗi trong register:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// [POST] /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('specialty');
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Thiếu biến môi trường JWT_SECRET');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    return res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        specialty: user.specialty?.name || null
      }
    });
  } catch (error) {
    console.error('Lỗi trong login:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};