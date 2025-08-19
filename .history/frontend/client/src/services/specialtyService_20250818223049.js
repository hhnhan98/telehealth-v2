// src/services/specialtyService.js
import axiosInstance from './api'; // đồng bộ với các service khác

// ------------------------- Helper -------------------------
const handleError = (err, context = 'SpecialtyService') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  throw err.response?.data || err;
};

// ------------------------- Specialty APIs -------------------------

/**
 * Lấy danh sách tất cả chuyên khoa
 * @returns {Promise<Array>} mảng các specialty { _id, name, ... }

export const fetchSpecialties = async () => {
  try {
    const res = await axiosInstance.get('/specialties');
    return res.data?.specialties || []; // đảm bảo luôn trả về mảng
  } catch (err) {
    return handleError(err);
  }
};

// Lấy danh sách chuyên khoa theo cơ sở y tế
export const fetchSpecialtiesByLocation = async (locationId) => {
  if (!locationId) return [];
  try {
    const res = await axiosInstance.get(`/specialties?locationId=${locationId}`);
    return res.data?.specialties || [];
  } catch (err) {
    return handleError(err, 'fetchSpecialtiesByLocation');
  }
};

// ------------------------- Export -------------------------
const specialtyService = {
  fetchSpecialties,
  fetchSpecialtiesByLocation,
};

export default specialtyService;
