const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      role,
      fullName,
      email,
      password: hashedPassword,
      ...(role === 'doctor' && { specialty }),
    });

    await newUser.save();

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        role: newUser.role,
        fullName: newUser.fullName,
        email: newUser.email,
        specialty: newUser.specialty || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        specialty: user.specialty || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
