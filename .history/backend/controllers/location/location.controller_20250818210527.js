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
