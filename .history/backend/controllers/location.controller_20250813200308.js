const Location = require('../models/location.model');

// Lấy tất cả địa điểm
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    console.error('Lỗi lấy danh sách location:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách địa điểm' });
  }
};

// Tạo mới địa điểm
exports.createLocation = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const location = new Location({ name, address, phone });
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    console.error('Lỗi tạo location:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo địa điểm' });
  }
};
