// backend/controllers/admin/admin.controller.js
const User = require('../../models/User');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ---------------- Users ----------------
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, location, specialty } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashedPassword, role, location, specialty });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, select: '-password' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa user thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const hashed = await bcrypt.hash('12345678', 10);
    await User.findByIdAndUpdate(id, { password: hashed });
    res.json({ success: true, message: 'Reset mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Locations ----------------
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({}).populate('specialties', 'name');
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createLocation = async (req, res) => {
  try {
    const { name, address, specialties: specialtyIds = [] } = req.body;
    const location = await Location.create({ name, address, specialties: specialtyIds });

    // Cập nhật specialty.locations nếu cần
    await Promise.all(
      specialtyIds.map(async sId => {
        const spec = await Specialty.findById(sId);
        if (spec && !spec.locations.includes(location._id)) {
          spec.locations.push(location._id);
          await spec.save();
        }
      })
    );

    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, specialties: newSpecialtyIds = [] } = req.body;
    const location = await Location.findByIdAndUpdate(id, { name, address, specialties: newSpecialtyIds }, { new: true });

    // Đồng bộ specialty.locations
    const allSpecialties = await Specialty.find({});
    await Promise.all(allSpecialties.map(async spec => {
      if (newSpecialtyIds.includes(spec._id.toString())) {
        if (!spec.locations.includes(id)) {
          spec.locations.push(id);
          await spec.save();
        }
      } else {
        if (spec.locations.includes(id)) {
          spec.locations = spec.locations.filter(lId => lId.toString() !== id);
          await spec.save();
        }
      }
    }));

    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await Specialty.updateMany({}, { $pull: { locations: id } });
    await Doctor.deleteMany({ location: id });
    await Location.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa location thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Specialties ----------------
const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find({}).populate('locations', 'name');
    res.json({ success: true, data: specialties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSpecialty = async (req, res) => {
  try {
    const { name, description, locations: locationIds = [] } = req.body;
    const specialty = await Specialty.create({ name, description, locations: locationIds });
    res.json({ success: true, data: specialty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, locations: newLocationIds = [] } = req.body;
    const specialty = await Specialty.findByIdAndUpdate(id, { name, description, locations: newLocationIds }, { new: true });
    res.json({ success: true, data: specialty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    await Specialty.findByIdAndDelete(id);
    await Doctor.updateMany({ specialty: id }, { $unset: { specialty: '' } });
    res.json({ success: true, message: 'Xóa specialty thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Doctors ----------------
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('user', 'fullName email').populate('specialty', 'name').populate('location', 'name');
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { user, fullName, specialty, location, phone, bio } = req.body;

    // Kiểm tra user chưa là doctor
    const exist = await Doctor.findOne({ user });
    if (exist) return res.status(400).json({ success: false, message: 'User này đã là doctor' });

    // Kiểm tra specialty thuộc location
    const spec = await Specialty.findById(specialty);
    if (!spec || !spec.locations.includes(location)) {
      return res.status(400).json({ success: false, message: 'Specialty không thuộc location' });
    }

    const doctor = await Doctor.create({ user, fullName, specialty, location, phone, bio });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, fullName, specialty, location, phone, bio } = req.body;

    // Kiểm tra specialty thuộc location
    const spec = await Specialty.findById(specialty);
    if (!spec || !spec.locations.includes(location)) {
      return res.status(400).json({ success: false, message: 'Specialty không thuộc location' });
    }

    const doctor = await Doctor.findByIdAndUpdate(id, { user, fullName, specialty, location, phone, bio }, { new: true });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa doctor thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
