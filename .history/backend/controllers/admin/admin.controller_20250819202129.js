// backend/controllers/admin/admin.controller.js
const User = require('../../models/User');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const bcrypt = require('bcryptjs');

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
    const hashed = await bcrypt.hash('12345678', 10); // Mật khẩu mặc định
    await User.findByIdAndUpdate(id, { password: hashed });
    res.json({ success: true, message: 'Reset mật khẩu thành công' });
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
    const { name, address, specialties: specialtyIds = [] } = req.body;
    const location = await Location.create({ name, address });

    // Gắn location mới vào các specialty
    await Promise.all(specialtyIds.map(async sId => {
      const spec = await Specialty.findById(sId);
      if (spec && !spec.locations.includes(location._id)) {
        spec.locations.push(location._id);
        await spec.save();
      }
    }));

    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, specialties: newSpecialtyIds = [] } = req.body;
    const location = await Location.findByIdAndUpdate(id, { name, address }, { new: true });

    // Đồng bộ Specialty.locations
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
    // Remove location khỏi specialty
    await Specialty.updateMany({}, { $pull: { locations: id } });
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
    const { name, description, locations: locationIds = [] } = req.body;
    const specialty = await Specialty.create({ name, description, locations: locationIds });

    // Cập nhật location nếu cần (chỉ giữ reference trong specialty)
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

    // Remove specialty khỏi users
    await User.updateMany({ specialty: id }, { $unset: { specialty: '' } });

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
  resetUserPassword,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
