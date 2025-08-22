const User = require('../models/User');
const Patient = require('../models/Patient');
const Specialty = require('../models/Specialty');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/sendEmail');

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
const responseSuccess = (res, message, data = {}) =>
  res.status(200).json({ success: true, message, data });
const responseError = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

// [POST] /api/auth/register
exports.register = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty, location } = req.body;

    // --- Validate input cơ bản
    if (!role || !fullName || !email || !password) {
      return responseError(res, 'Vui lòng điền đầy đủ thông tin');
    }

    if (role === 'doctor' && (!specialty || !location)) {
      return responseError(res, 'Bác sĩ cần chọn chuyên khoa và cơ sở');
    }

    // --- Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (existingUser) return responseError(res, 'Email đã tồn tại');

    // --- Lấy specialty nếu role là doctor
    let specialtyId = null;
    let specialtyName = null;

    if (role === 'doctor') {
      const foundSpecialty = await Specialty.findById(specialty);
      if (!foundSpecialty) return responseError(res, 'Chuyên khoa không hợp lệ');

      // --- Validate location thuộc specialty
      if (!foundSpecialty.locations.includes(location)) {
        return responseError(res, 'Cơ sở không thuộc chuyên khoa');
      }

      specialtyId = foundSpecialty._id;
      specialtyName = foundSpecialty.name;
    }

    // --- Tạo user mới
    const newUser = new User({
      role,
      fullName: fullName.trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password), // trim + hash sẽ xử lý trong pre-save hook
      ...(role === 'doctor' && { specialty: specialtyId, location }),
    });

    //console.log('[Register] Trước khi save - Password raw:', newUser.password);
    console.log('[Register] chuẩn bị save user:', newUser.email, newUser.role);

    await newUser.save();

    // --- Chuẩn hóa role trước khi sử dụng
    const roleNormalized = String(role).trim().toLowerCase();

    // --- Tự động tạo Patient document nếu role là patient
    if (roleNormalized === 'patient') {
      try {
        const existingPatient = await Patient.findOne({ user: newUser._id });
        if (!existingPatient) {
          const patientDoc = await Patient.create({ user: newUser._id });
          console.log(`🎉 Patient document đã được tạo cho ${newUser.fullName}`);
          console.log(patientDoc); // log toàn bộ document mới tạo
        } else {
          console.log(`⚠️ Patient document đã tồn tại cho ${newUser.fullName}`);
        }
      } catch (err) {
        console.error('❌ Tạo Patient document thất bại:', err.message, err.stack);
      }
    }


    
    if (role === 'doctor') {
      // Specialty
      const specialtyDoc = await Specialty.findById(specialtyId);
      if (specialtyDoc) {
        // Khởi tạo array nếu chưa có
        if (!Array.isArray(specialtyDoc.doctors)) specialtyDoc.doctors = [];

        // Chỉ push nếu chưa tồn tại
        if (!specialtyDoc.doctors.includes(newUser._id)) {
          specialtyDoc.doctors.push(newUser._id);
          await specialtyDoc.save();
        }
      }
      // Location
      const locationDoc = await Location.findById(locationId);
      if (locationDoc) {
        // Khởi tạo array
        if (!Array.isArray(locationDoc.doctors)) locationDoc.doctors = [];

        // Chỉ push nếu chưa tồn tại
        if (!locationDoc.doctors.includes(newUser._id)) {
          locationDoc.doctors.push(newUser._id);
          await locationDoc.save();
        }
      }
    }

    //console.log('[Register] Sau khi save - Password hashed:', newUser.password);
    return responseSuccess(res, 'Đăng ký thành công', {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      specialty: specialtyName || null,
    });
  } catch (error) {
    //console.error('Lỗi trong register:', error);
    return responseError(res, 'Lỗi server', 500);
  }
};

// [POST] /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return responseError(res, 'Vui lòng nhập email và mật khẩu');

    // --- Lấy user theo email
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).populate('specialty');
    if (!user) return responseError(res, 'Email hoặc mật khẩu không đúng', 401);

    // console.log('[Login] Password nhập từ FE:', password);
    // console.log('[Login] Password hashed từ DB:', user.password);

    // --- So sánh password bằng phương thức của model
    const isMatch = await user.comparePassword(password);
    //console.log('[Login] Kết quả so sánh password:', isMatch);

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
    //console.error('Lỗi trong login:', error);
    return responseError(res, 'Lỗi server', 500);
  }
};
