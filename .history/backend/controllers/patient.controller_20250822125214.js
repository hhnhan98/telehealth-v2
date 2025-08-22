const Patient = require('../models/Patient');
const User = require('../models/User');
const path = require('path');
const fs = require('fs'); 
const { responseSuccess, responseError } = require('../utils/response');

// === Lấy hồ sơ bệnh nhân hiện đang đăng nhập ===
const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'fullName email birthYear gender phone avatar bio')
      .lean();

    if (!patient) return responseError(res, 'Không tìm thấy hồ sơ bệnh nhân', 404);

    return responseSuccess(res, 'Hồ sơ bệnh nhân', patient);
  } catch (err) {
    console.error('Lỗi getMyProfile:', err);
    return responseError(res, 'Lỗi khi lấy hồ sơ bệnh nhân', 500, err.message);
  }
};

// === Cập nhật hồ sơ bệnh nhân ===
const updateMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return responseError(res, 'Không tìm thấy hồ sơ bệnh nhân', 404);

    // --- Cập nhật Patient ---
    const patientFields = ['address', 'bio', 'medicalHistory'];
    patientFields.forEach(field => {
      if (req.body[field] !== undefined) patient[field] = req.body[field];
    });
    await patient.save();

    // --- Cập nhật User ---
    const userFields = ['fullName', 'birthYear', 'gender', 'phone', 'bio'];
    const user = await User.findById(req.user._id);

    userFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // --- Upload avatar nếu có file ---
    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`;

      // Xóa avatar cũ nếu tồn tại và không phải avatar mặc định
      if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
        const oldPath = path.join(process.cwd(), 'public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      user.avatar = avatarPath;
    }

    await user.save();

    // --- Trả về hồ sơ đầy đủ sau khi update ---
    const updatedPatient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'fullName email birthYear gender phone avatar bio');

    return responseSuccess(res, 'Cập nhật hồ sơ thành công', updatedPatient);
  } catch (err) {
    console.error('Lỗi updateMyProfile:', err);
    return responseError(res, 'Lỗi khi cập nhật hồ sơ', 400, err.message);
  }
};

// Export CommonJS
module.exports = {
  getMyProfile,
  updateMyProfile,
};
