// src/services/specialtyService.js
import axiosInstance from './api'; // đồng bộ với các service khác

// ------------------------- Helper -------------------------
const handleError = (err) => {
  console.error('SpecialtyService error:', err.response?.data || err.message || err);
  throw err.response?.data || err;
};

// ------------------------- Specialty APIs -------------------------

/**
 * Lấy danh sách tất cả chuyên khoa
 * @returns {Promise<Array>} mảng các specialty { _id, name, ... }
 */
export const fetchSpecialties = async () => {
  try {
    const res = await axiosInstance.get('/specialties');
    return res.data.specialties || []; // đảm bảo luôn trả về mảng
  } catch (err) {
    return handleError(err);
  }
};

// ------------------------- Export -------------------------
const specialtyService = {
  fetchSpecialties
};

export default specialtyService;
