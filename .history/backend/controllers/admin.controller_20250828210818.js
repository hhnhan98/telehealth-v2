const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');

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
    const { fullName, email, password, role, phone, gender, specialty, locations } = req.body;

    if (role === 'doctor') {
      if (!specialty || !locations || locations.length === 0)
        throw new Error('Bác sĩ phải chọn chuyên khoa và ít nhất 1 cơ sở');

      const foundSpecialty = await Specialty.findById(specialty).session(session);
      const foundLocations = await Location.find({ _id: { $in: locations } }).session(session);
      if (!foundSpecialty || foundLocations.length !== locations.length)
        throw new Error('Specialty hoặc Location không tồn tại');
    }

    const hashed = await hashPassword(password || '123456');
    const user = await User.create([{ fullName, email, password: hashed, role, phone, gender }], { session });
    const newUser = user[0];

    let newDoctor = null;
    if (role === 'doctor') {
      newDoctor = await Doctor.create([{ user: newUser._id, specialty, locations }], { session });

      // Update Specialty & Location doctors array
      await Specialty.findByIdAndUpdate(specialty, { $addToSet: { doctors: newUser._id } }, { session });
      await Location.updateMany({ _id: { $in: locations } }, { $addToSet: { doctors: newUser._id } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    const populatedDoctor = newDoctor
      ? await Doctor.findById(newDoctor[0]._id)
          .populate('user', 'fullName email')
          .populate('specialty', 'name')
          .populate('locations', 'name')
      : null;

    res.status(201).json({ success: true, data: { user: newUser, doctor: populatedDoctor } });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error createUser:', err);
    res.status(500).json({ success: false, message: err.message });
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

    if (user.role === 'doctor' && (update.specialty || update.locations)) {
      const doctor = await Doctor.findOne({ user: id }).session(session);
      if (doctor) {
        if (update.specialty && doctor.specialty.toString() !== update.specialty) {
          await Specialty.findByIdAndUpdate(doctor.specialty, { $pull: { doctors: doctor.user } }, { session });
          await Specialty.findByIdAndUpdate(update.specialty, { $addToSet: { doctors: doctor.user } }, { session });
          doctor.specialty = update.specialty;
        }
        if (update.locations) {
          // Remove from old locations
          await Location.updateMany(
            { _id: { $in: doctor.locations } },
            { $pull: { doctors: doctor.user } },
            { session }
          );
          // Add to new locations
          await Location.updateMany(
            { _id: { $in: update.locations } },
            { $addToSet: { doctors: doctor.user } },
            { session }
          );
          doctor.locations = update.locations;
        }
        await doctor.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updateUser:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const user = await User.findById(id).session(session);
    if (!user) throw new Error('User không tồn tại');

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: id }).session(session);
      if (doctor) {
        await Specialty.findByIdAndUpdate(doctor.specialty, { $pull: { doctors: user._id } }, { session });
        await Location.updateMany({ _id: { $in: doctor.locations } }, { $pull: { doctors: user._id } }, { session });
        await Doctor.findByIdAndDelete(doctor._id, { session });
      }
    }

    await User.findByIdAndDelete(id, { session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, message: 'Xóa user thành công' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleteUser:', err);
    res.status(500).json({ success: false, message: err.message });
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
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'fullName email')
      .populate('specialty', 'name')
      .populate('locations', 'name');
    res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    console.error('Error getAllDoctors:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy doctors' });
  }
};

// ================= Locations =================
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find()
      .populate({
        path: 'doctors',
        populate: [
          { path: 'user', select: 'fullName email' },
          { path: 'specialty', select: 'name' },
        ],
      });
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    console.error('Error getAllLocations:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy locations' });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name } = req.body;
    const exist = await Location.findOne({ name });
    if (exist) return res.status(400).json({ success: false, message: 'Tên cơ sở đã tồn tại' });

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
    const location = await Location.findById(id);
    if (!location) return res.status(404).json({ success: false, message: 'Location không tồn tại' });

    const doctors = await Doctor.find({ locations: id });
    if (doctors.length > 0) return res.status(400).json({ success: false, message: 'Không thể xóa location đang có bác sĩ' });

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
    const specialties = await Specialty.find()
      .populate('locations', 'name')
      .populate({
        path: 'doctors',
        populate: [
          { path: 'user', select: 'fullName email' },
          { path: 'locations', select: 'name' },
        ],
      });
    res.status(200).json({ success: true, data: specialties });
  } catch (err) {
    console.error('Error getAllSpecialties:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy specialties' });
  }
};

exports.createSpecialty = async (req, res) => {
  try {
    const { name, locations } = req.body;
    if (!locations || locations.length === 0)
      return res.status(400).json({ success: false, message: 'Specialty phải có ít nhất 1 location' });

    // Kiểm tra trùng tên trong cùng location
    const exist = await Specialty.findOne({ name, locations: { $in: locations } });
    if (exist) return res.status(400).json({ success: false, message: 'Specialty đã tồn tại trong location này' });

    const specialty = await Specialty.create(req.body);
    await specialty.populate('locations', 'name');
    res.status(201).json({ success: true, data: specialty });
  } catch (err) {
    console.error('Error createSpecialty:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo specialty' });
  }
};

exports.updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, locations } = req.body;

    if (name && locations && locations.length > 0) {
      const exist = await Specialty.findOne({ _id: { $ne: id }, name, locations: { $in: locations } });
      if (exist) return res.status(400).json({ success: false, message: 'Specialty đã tồn tại trong location này' });
    }

    const updated = await Specialty.findByIdAndUpdate(id, req.body, { new: true }).populate('locations', 'name');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updateSpecialty:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật specialty' });
  }
};

exports.deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const doctors = await Doctor.find({ specialty: id });
    if (doctors.length > 0) return res.status(400).json({ success: false, message: 'Không thể xóa specialty đang có bác sĩ' });

    await Specialty.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa specialty thành công' });
  } catch (err) {
    console.error('Error deleteSpecialty:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa specialty' });
  }
};
