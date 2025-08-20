const User = require('../../models/User');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');

// ---------------- Users ----------------
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
};

exports.createUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const newUser = new User({ fullName, email, password, role });
  await newUser.save();
  res.json({ success: true, data: newUser });
};

exports.updateUser = async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
};

// ---------------- Locations ----------------
exports.getAllLocations = async (req, res) => {
  const locations = await Location.find();
  res.json({ success: true, data: locations });
};

exports.createLocation = async (req, res) => {
  const loc = new Location(req.body);
  await loc.save();
  res.json({ success: true, data: loc });
};

exports.updateLocation = async (req, res) => {
  const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
};

exports.deleteLocation = async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Location deleted' });
};

// ---------------- Specialties ----------------
exports.getAllSpecialties = async (req, res) => {
  const specialties = await Specialty.find();
  res.json({ success: true, data: specialties });
};

exports.createSpecialty = async (req, res) => {
  const spec = new Specialty(req.body);
  await spec.save();
  res.json({ success: true, data: spec });
};

exports.updateSpecialty = async (req, res) => {
  const updated = await Specialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
};

exports.deleteSpecialty = async (req, res) => {
  await Specialty.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Specialty deleted' });
};
