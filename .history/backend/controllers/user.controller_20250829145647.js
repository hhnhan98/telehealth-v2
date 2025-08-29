const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const { responseSuccess, responseError } = require('../utils/response');

// Hash password trước khi lưu
const hashPassword = async (password) => bcrypt.hash(password, 10);

// Kiểm tra specialty là ObjectId hay tên, trả về _id hợp lệ
const resolveSpecialty = async (specialty) => {
  if (!specialty) return null;
  const isValidId = /^[0-9a-fA-F]{24}$/.test(specialty);
  if (isValidId) return specialty;

  const specDoc = await Specialty.findOne({ name: specialty });
  if (!specDoc) throw new Error('Chuyên khoa không tồn tại');
  return specDoc._id;
};

// Lấy danh sách người dùng, có thể lọc theo role hoặc specialty
exports.getAllUsers = async (req, res) => {
  try {
    const { role, specialty } = req.query;
    const filter = {};
    if (role) filter.role = role;

    if (specialty) {
      const specialtyId = await resolveSpecialty(specialty);
      const doctors = await Doctor.find({ specialty: specialtyId }).select('user');
      const userIds = doctors.map((d) => d.user);
      filter._id = { $in: userIds };
    }

    const users = await User.find(filter).select('-password');
    return responseSuccess(res, 'Danh sách người dùng', { users });
  } catch (err) {
    return responseError(res, err.message || 'Không thể lấy danh sách người dùng', 500);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return responseError(res, 'Không tìm thấy người dùng', 404);

    // Nếu là bác sĩ, kèm theo hồ sơ Doctor
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id })
        .populate('specialty', 'name')
        .populate('location', 'name');
    }

    return responseSuccess(res, 'Thông tin người dùng', { user, doctorProfile });
  } catch (err) {
    return responseError(res, err.message || 'Lỗi server', 500);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return responseError(res, 'Token không hợp lệ hoặc đã hết hạn', 401);

    const user = await User.findById(userId).select('-password');
    if (!user) return responseError(res, 'Không tìm thấy người dùng', 404);

    // Bác sĩ thì trả thêm doctorProfile
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id })
        .populate('specialty', 'name')
        .populate('location', 'name');
    }

    return responseSuccess(res, 'Hồ sơ cá nhân', { user, doctorProfile });
  } catch (err) {
    return responseError(res, err.message || 'Lỗi server', 500);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty, location, phone, bio } = req.body;

    if (!role || !fullName || !email || !password) {
      return responseError(res, 'Thiếu thông tin bắt buộc', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) return responseError(res, 'Email đã tồn tại', 400);

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ role, fullName, email, password: hashedPassword });

    if (role === 'doctor') {
      if (!specialty || !location) {
        return responseError(res, 'Bác sĩ cần có specialty và location', 400);
      }

      const specialtyId = await resolveSpecialty(specialty);
      await Doctor.create({
        user: newUser._id,
        fullName: newUser.fullName,
        specialty: specialtyId,
        location,
        phone: phone || '',
        bio: bio || '',
      });
    }

    return responseSuccess(res, 'Tạo user thành công', { user: newUser }, 201);
  } catch (err) {
    return responseError(res, err.message || 'Tạo user thất bại', 400);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, fullName, // User fields
            specialty, location, phone, bio } = req.body; // Doctor fields

    const user = await User.findById(req.params.id);
    if (!user) return responseError(res, 'Không tìm thấy người dùng', 404);

    // ----- Cập nhật User -----
    if (typeof fullName === 'string' && fullName.trim() !== '') user.fullName = fullName.trim();

    if (typeof req.body.gender !== 'undefined') user.gender = req.body.gender;
    if (typeof req.body.phone === 'string') user.phone = req.body.phone;
    if (typeof req.body.birthYear !== 'undefined') user.birthYear = req.body.birthYear;

    if (typeof password === 'string' && password.trim() !== '') {
      user.password = await hashPassword(password);
    }

    await user.save();

    let doctorUpdated = null;
    if (user.role === 'doctor' && (specialty || location || phone || bio || fullName)) {
      const doc = await Doctor.findOne({ user: user._id });
      if (doc) {
        if (fullName && fullName.trim() !== '') doc.fullName = fullName.trim();
        if (typeof phone === 'string') doc.phone = phone;
        if (typeof bio === 'string') doc.bio = bio;
        if (specialty) doc.specialty = await resolveSpecialty(specialty);
        if (location) doc.location = location;

        await doc.save();
        doctorUpdated = await doc.populate([{ path: 'specialty', select: 'name' }, { path: 'location', select: 'name' }]);
      }
    }

    return responseSuccess(res, 'Cập nhật thành công', {
      user: user.toJSON(),
      doctorProfile: doctorUpdated,
    });
  } catch (err) {
    return responseError(res, err.message || 'Cập nhật thất bại', 400);
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return responseError(res, 'Người dùng không tồn tại', 404);

    const { password, fullName, specialty, location, phone, bio } = req.body;

    // ----- Update User -----
    const allowedFields = ['fullName', 'phone', 'gender', 'birthYear'];
    allowedFields.forEach((field) => {
      if (typeof req.body[field] !== 'undefined' && req.body[field] !== '') {
        user[field] = req.body[field];
      }
    });

    if (typeof password === 'string' && password.trim() !== '') {
      user.password = await hashPassword(password);
    }

    await user.save();

    // ----- Nếu là bác sĩ, update Doctor -----
    let doctorUpdated = null;
    if (user.role === 'doctor' && (specialty || location || phone || bio || fullName)) {
      const doc = await Doctor.findOne({ user: user._id });
      if (doc) {
        if (typeof fullName === 'string' && fullName.trim() !== '') doc.fullName = fullName.trim();
        if (typeof phone === 'string') doc.phone = phone;
        if (typeof bio === 'string') doc.bio = bio;
        if (specialty) doc.specialty = await resolveSpecialty(specialty);
        if (location) doc.location = location;

        await doc.save();
        doctorUpdated = await doc.populate([{ path: 'specialty', select: 'name' }, { path: 'location', select: 'name' }]);
      }
    }

    return responseSuccess(res, 'Cập nhật hồ sơ thành công', {
      user: user.toJSON(),
      doctorProfile: doctorUpdated,
    });
  } catch (err) {
    return responseError(res, err.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ', 500);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return responseError(res, 'Không tìm thấy người dùng', 404);

    // Nếu là bác sĩ, xóa luôn hồ sơ Doctor (nếu có)
    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    return responseSuccess(res, 'Đã xoá user', { userId: user._id });
  } catch (err) {
    return responseError(res, err.message || 'Xoá thất bại', 500);
  }
};

exports.getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;
    const filter = {};
    if (specialty) filter.specialty = await resolveSpecialty(specialty);

    const doctors = await Doctor.find(filter)
      .select('fullName user specialty location phone bio')
      .populate('user', 'fullName avatar email')
      .populate('specialty', 'name')
      .populate('location', 'name');

    return responseSuccess(res, 'Danh sách bác sĩ', { doctors });
  } catch (err) {
    return responseError(res, err.message || 'Không thể lấy danh sách bác sĩ', 500);
  }
};