const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ================= Helper =================
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// ================= Users =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Error getAllUsers:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy users' });
  }
};

exports.createUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fullName, email, password, role, phone, gender, specialty, location } = req.body;

    if (role === 'doctor') {
      if (!specialty || !location) throw new Error('Bác sĩ phải chọn chuyên khoa và cơ sở y tế');
      const foundSpecialty = await Specialty.findById(specialty);
      const foundLocation = await Location.findById(location);
      if (!foundSpecialty || !foundLocation) throw new Error('Specialty hoặc Location không tồn tại');
    }

    const hashed = await hashPassword(password);
    const user = await User.create([{ fullName, email, password: hashed, role, phone, gender }], { session });
    const newUser = user[0];

    let newDoctor = null;
    if (role === 'doctor') {
      newDoctor = await Doctor.create([{ user: newUser._id, specialty, location }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        doctor: newDoctor ? newDoctor[0] : null,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error createUser:', err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi server khi tạo user' });
  }
};

exports.updateUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const update = { ...req.body };

    if (update.password) update.password = await hashPassword(update.password);

    const user = await User.findByIdAndUpdate(id, update, { new: true, session }).select('-password');
    if (!user) throw new Error('User không tồn tại');

    // Nếu role = doctor, update Doctor collection
    if (user.role === 'doctor' && update.specialty && update.location) {
      await Doctor.findOneAndUpdate({ user: id }, { specialty: update.specialty, location: update.location }, { session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updateUser:', err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi server khi cập nhật user' });
  }
};

exports.deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const user = await User.findById(id).session(session);
    if (!user) throw new Error('User không tồn tại');

    // Xóa Doctor nếu là bác sĩ
    if (user.role === 'doctor') await Doctor.findOneAndDelete({ user: id }, { session });

    await User.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Xóa user thành công' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleteUser:', err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi server khi xóa user' });
  }
};

exports.resetPasswordUser = async (req, res) => {
  try {
    const { id } = req.params;
    const hashed = await hashPassword('123456');
    await User.findByIdAndUpdate(id, { password: hashed });
    res.status(200).json({ success: true, message: 'Reset mật khẩu thành công' });
  } catch (err) {
    console.error('Error resetPasswordUser:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi reset mật khẩu' });
  }
};

// ================= Doctors =================
// giữ nguyên create/update/delete như cũ, nhưng đảm bảo updateDoctor xử lý session và populate đầy đủ


// ================= Doctors =================
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'fullName email')
      .populate('location', 'name')
      .populate('specialty', 'name');
    res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    console.error('Error getAllDoctors:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy doctors' });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { user, specialty, location } = req.body;

    if (!user || !specialty || !location) {
      return res.status(400).json({ success: false, message: 'Bác sĩ phải có user, chuyên khoa và cơ sở' });
    }

    const doctor = await Doctor.create(req.body);
    const populated = await doctor
      .populate('user', 'fullName email')
      .populate('location', 'name')
      .populate('specialty', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('Error createDoctor:', err);
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
    console.error('Error updateDoctor:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật doctor' });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa doctor thành công' });
  } catch (err) {
    console.error('Error deleteDoctor:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa doctor' });
  }
};

// ================= Locations =================
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    console.error('Error getAllLocations:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy locations' });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    console.error('Error createLocation:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo location' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Location.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updateLocation:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật location' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa location thành công' });
  } catch (err) {
    console.error('Error deleteLocation:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa location' });
  }
};

// ================= Specialties =================
exports.getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().populate('location', 'name');
    res.status(200).json({ success: true, data: specialties });
  } catch (err) {
    console.error('Error getAllSpecialties:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy specialties' });
  }
};

exports.createSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.create(req.body);
    const populated = await specialty.populate('location', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('Error createSpecialty:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo specialty' });
  }
};

exports.updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Specialty.findByIdAndUpdate(id, req.body, { new: true }).populate('location', 'name');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updateSpecialty:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật specialty' });
  }
};

exports.deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    await Specialty.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa specialty thành công' });
  } catch (err) {
    console.error('Error deleteSpecialty:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa specialty' });
  }
};
