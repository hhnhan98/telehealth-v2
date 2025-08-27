const User = require('../models/User');
const jwt = require('jsonwebtoken');

// --- Helper tạo JWT token
const createAccessToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error('Thiếu biến môi trường JWT_SECRET');
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

// --- Helper chuẩn hóa response
const responseSuccess = (res, message, data = {}) =>
  res.status(200).json({ success: true, message, data });

const responseError = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

// --- [POST] /api/auth/register
exports.register = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty, location } = req.body;

    // Validate input cơ bản
    if (!role || !fullName || !email || !password) {
      return responseError(res, 'Vui lòng điền đầy đủ thông tin');
    }

    if (role === 'doctor' && (!specialty || !location)) {
      return responseError(res, 'Bác sĩ cần chọn chuyên khoa và cơ sở');
    }

    const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (existingUser) return responseError(res, 'Email đã tồn tại');

    // --- Tạo User mới
    const newUser = new User({
      role,
      fullName: fullName.trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      ...(role === 'doctor' && { specialty, location }),
    });

    // Khi save, post-save hook trong User model sẽ tự tạo Patient/Doctor document và cập nhật Specialty/Location
    await newUser.save();

    return responseSuccess(res, 'Đăng ký thành công', {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error('Lỗi trong register:', error);
    return responseError(res, 'Lỗi server', 500);
  }
};

// --- [POST] /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return responseError(res, 'Vui lòng nhập email và mật khẩu');

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).populate('specialty').populate('user');
    if (!user) return responseError(res, 'Email hoặc mật khẩu không đúng', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return responseError(res, 'Email hoặc mật khẩu không đúng', 401);

    const token = createAccessToken(user);

    return responseSuccess(res, 'Đăng nhập thành công', {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        specialty: user.specialty?.name || null,
      },
    });
  } catch (error) {
    console.error('Lỗi trong login:', error);
    return responseError(res, 'Lỗi server', 500);
  }
};
