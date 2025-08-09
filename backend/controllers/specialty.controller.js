const Specialty = require('../models/Specialty');

// Lấy toàn bộ chuyên khoa
exports.getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách chuyên khoa' });
  }
};
