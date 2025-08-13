const Location = require('../models/Location');

// Lấy toàn bộ danh sách địa điểm
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 }); // sort theo tên
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách địa điểm', error: error.message });
  }
};
