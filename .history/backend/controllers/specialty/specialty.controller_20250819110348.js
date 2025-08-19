const Specialty = require('../../models/Specialty');
const { responseSuccess, responseError } = require('../../utils/response');

/**
 * Lấy tất cả chuyên khoa
const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });
    return responseSuccess(res, 'Danh sách chuyên khoa', specialties);
  } catch (err) {
    console.error('Lỗi lấy danh sách chuyên khoa:', err);
    return responseError(res, 'Lỗi server khi lấy danh sách chuyên khoa', 500);
  }
};

module.exports = { getAllSpecialties };

// const Specialty = require('../../models/Specialty');

// // Lấy toàn bộ chuyên khoa
// exports.getAllSpecialties = async (req, res) => {
//   try {
//     const specialties = await Specialty.find().sort({ name: 1 });
//     res.json(specialties);
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi server khi lấy danh sách chuyên khoa' });
//   }
// };
