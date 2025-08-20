// backend/controllers/admin/admin.controller.js
const User = require('../../models/User');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const bcrypt = require('bcryptjs');

// ---------------- Users ----------------
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // loại bỏ password
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashedPassword, role });
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

// ---------------- Locations ----------------
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa location thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Specialties ----------------
const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find({});
    res.json({ success: true, data: specialties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.create(req.body);
    res.json({ success: true, data: specialty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await Specialty.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: specialty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    await Specialty.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa specialty thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
