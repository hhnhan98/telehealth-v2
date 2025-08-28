const Specialty = require('../models/Specialty');
const { responseSuccess, responseError } = require('../utils/response');

// Lấy chuyên khoa, có thể lọc theo locationId
const getAllSpecialties = async (req, res) => {
  try {
    const { locationId } = req.query;

    let filter = {};

    if (locationId) filter.location = locationId;

    const specialties = await Specialty.find(filter``)
      .sort({ name: 1 })
      .populate('location')
      .lean();
    return responseSuccess(res, 'Danh sách chuyên khoa', specialties);
  } catch (err) {
    console.error('Lỗi lấy danh sách chuyên khoa:', err);
    return responseError(res, 'Lỗi server khi lấy danh sách chuyên khoa', 500);
  }
};

module.exports = { getAllSpecialties };
