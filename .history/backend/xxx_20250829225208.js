// ===== PatientController - Backend core logic =====
const Patient = require('../models/Patient');
const User = require('../models/User');
const { responseSuccess, responseError } = require('../utils/response');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Lấy hồ sơ bệnh nhân hiện tại
exports.getMyProfile = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate('user', 'fullName email birthYear gender phone avatar bio')
    .lean();
  if (!patient) return responseError(res, 'Không tìm thấy hồ sơ', 404);
  return responseSuccess(res, 'Hồ sơ bệnh nhân', patient);
};

// Cập nhật hồ sơ bệnh nhân
exports.updateMyProfile = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) return responseError(res, 'Không tìm thấy hồ sơ', 404);

  // Cập nhật patient info
  ['address', 'bio', 'medicalHistory'].forEach(f => {
    if (req.body[f] !== undefined) patient[f] = req.body[f];
  });
  await patient.save();

  // Cập nhật user info
  const user = await User.findById(req.user._id);
  ['fullName', 'birthYear', 'gender', 'phone', 'bio'].forEach(f => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });

  // Cập nhật avatar nếu có file mới
  if (req.file) {
    const avatarPath = `/uploads/${req.file.filename}`;
    if (user.avatar && user.avatar !== 'uploads/default-avatar.png') {
      const oldPath = path.join(process.cwd(), 'public', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.avatar = avatarPath;
  }

  await user.save();

  const updatedPatient = await Patient.findOne({ user: req.user._id })
    .populate('user', 'fullName email birthYear gender phone avatar bio');

  return responseSuccess(res, 'Cập nhật hồ sơ thành công', updatedPatient);
};

// Đổi mật khẩu bệnh nhân
exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return responseError(res, 'Người dùng không tồn tại', 404);

  const isMatch = await bcrypt.compare(req.body.current, user.password);
  if (!isMatch) return responseError(res, 'Mật khẩu hiện tại không đúng', 400);

  user.password = req.body.newPassword;
  await user.save();
  return responseSuccess(res, 'Đổi mật khẩu thành công');
};
