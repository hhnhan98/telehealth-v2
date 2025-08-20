const User = require('../../models/User');
const Specialty = require('../../models/Specialty');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../../utils/sendEmail');

// Helper tạo JWT token
const createAccessToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error('Thiếu biến môi trường JWT_SECRET');
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

// Helper chuẩn hóa response
const responseSuccess = (res, message, data = {}) => res.status(200).json({ success: true, message, data });
const responseError = (res, message, status = 400) => res.status(status).json({ success: false, message });

// [POST] /api/auth/register
exports.register = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty } = req.body;

    // --- Validate input cơ bản
    if (!role || !fullName || !email || !password) {
      return responseError(res, 'Vui lòng điền đầy đủ thông tin');
    }

    if (role === 'doctor' && !specialty) {
      return responseError(res, 'Bác sĩ cần chọn chuyên khoa');
    }

    // --- Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return responseError(res, 'Email đã tồn tại');

    // --- Lấy specialty nếu role là doctor
    let specialtyId = null;
    let specialtyName = null;

    if (role === 'doctor') {
      const foundSpecialty = await Specialty.findById(specialty);
      if (!foundSpecialty) return responseError(res, 'Chuyên khoa không hợp lệ');
      specialtyId = foundSpecialty._id;
      specialtyName = foundSpecialty.name;
    }

    // --- Tạo user mới (password sẽ được hash bởi pre-save hook)
    const newUser = new User({
      role,
      fullName,
      email: email.toLowerCase(),
      password, // chưa hash
      ...(role === 'doctor' && { specialty: specialtyId }),
    });

    await newUser.save();

    // --- (Optional) Gửi OTP xác thực email
    // await sendOtpEmail(newUser.email);

    return responseSuccess(res, 'Đăng ký thành công', {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      specialty: specialtyName || null,
    });
  } catch (error) {
    console.error('Lỗi trong register:', error);
    return responseError(res, 'Lỗi server', 500);
  }
};

// [POST] /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return responseError(res, 'Vui lòng nhập email và mật khẩu');

    // --- Lấy user theo email
    const user = await User.findOne({ email: email.toLowerCase() }).populate('specialty');
    if (!user) return responseError(res, 'Email hoặc mật khẩu không đúng', 401);

    // --- So sánh password với bcrypt native
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return responseError(res, 'Email hoặc mật khẩu không đúng', 401);

    // --- Tạo token
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
