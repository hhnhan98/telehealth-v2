const Location = require('../models/Location');
const { responseSuccess, responseError } = require('../utils/response');

// ------------------------- Lấy tất cả địa điểm -------------------------
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find()
    .sort({ name: 1 }); // sắp xếp theo tên
    return responseSuccess(res, 'Danh sách địa điểm', locations);
  } catch (err) {
    console.error('Lỗi lấy danh sách địa điểm:', err);
    return responseError(res, 'Lỗi khi lấy danh sách địa điểm', 500, err);
  }
};

// ------------------------- Tạo địa điểm mới -------------------------
const createLocation = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return responseError(res, 'Tên địa điểm là bắt buộc', 400);
    }

    const existing = await Location.findOne({ name: name.trim() });
    if (existing) {
      return responseError(res, 'Địa điểm đã tồn tại', 400);
    }

    const newLocation = new Location({ name: name.trim() });
    await newLocation.save();

    return responseSuccess(res, 'Tạo địa điểm thành công', newLocation, 201);
  } catch (err) {
    console.error('Lỗi tạo địa điểm:', err);
    return responseError(res, 'Lỗi khi tạo địa điểm', 500, err);
  }
};

module.exports = {
  getAllLocations,
  createLocation,
};

// const Location = require('../../models/Location.js');

// // Lấy tất cả địa điểm
// const getAllLocations = async (req, res) => {
//   try {
//     const locations = await Location.find();
//     res.status(200).json(locations);
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi khi lấy danh sách địa điểm', error: error.message });
//   }
// };

// // Tạo địa điểm mới
// const createLocation = async (req, res) => {
//   try {
//     const { name, address, province, district } = req.body;

//     if (!name || !address) {
//       return res.status(400).json({ message: 'Tên và địa chỉ là bắt buộc' });
//     }

//     const newLocation = new Location({
//       name,
//       address,
//       province,
//       district,
//     });

//     await newLocation.save();
//     res.status(201).json({ message: 'Tạo địa điểm thành công', location: newLocation });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi khi tạo địa điểm', error: error.message });
//   }
// };

// module.exports = {
//   getAllLocations,
//   createLocation,
// };
