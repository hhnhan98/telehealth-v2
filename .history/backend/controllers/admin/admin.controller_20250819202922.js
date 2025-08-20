const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const bcrypt = require('bcryptjs');

// ================= Users =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, phone, gender } = req.body;
    const user = await User.create({ fullName, email, password, role, phone, gender });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    const updated = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa user thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa user' });
  }
};

exports.resetPasswordUser = async (req, res) => {
  try {
    const { id } = req.params;
    const newPassword = '123456';
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, { password: hashed });
    res.status(200).json({ success: true, message: 'Reset mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi reset mật khẩu' });
  }
};

// ================= Doctors =================
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'fullName email')
      .populate('location', 'name')
      .populate('specialty', 'name');
    res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy doctors' });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    const populated = await doctor
      .populate('user', 'fullName email')
      .populate('location', 'name')
      .populate('specialty', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo doctor' });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Doctor.findByIdAndUpdate(id, req.body, { new: true })
      .populate('user', 'fullName email')
      .populate('location', 'name')
      .populate('specialty', 'name');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật doctor' });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa doctor thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa doctor' });
  }
};

// ================= Locations =================
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy locations' });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo location' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Location.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật location' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa location thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa location' });
  }
};

// ================= Specialties =================
exports.getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().populate('locations', 'name');
    res.status(200).json({ success: true, data: specialties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy specialties' });
  }
};

exports.createSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.create(req.body);
    const populated = await specialty.populate('locations', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo specialty' });
  }
};

exports.updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Specialty.findByIdAndUpdate(id, req.body, { new: true }).populate('locations', 'name');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật specialty' });
  }
};

exports.deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    await Specialty.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa specialty thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa specialty' });
  }
};
