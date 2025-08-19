// src/services/locationService.js
import axiosInstance from './api'; // đồng bộ với các service khác

// ------------------------- Helper -------------------------
const handleError = (err) => {
  console.error('LocationService error:', err.response?.data || err.message || err);
  throw err.response?.data || err;
};

// ------------------------- Location APIs -------------------------

/**
 * Lấy danh sách tất cả cơ sở y tế
 * @returns {Promise<Array>} mảng các location { _id, name, ... }
 */
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get('/locations');
    return res.data.locations || []; // đảm bảo luôn trả về mảng
  } catch (err) {
    return handleError(err);
  }
};

// ------------------------- Export -------------------------
const locationService = {
  fetchLocations
};

export default locationService;
