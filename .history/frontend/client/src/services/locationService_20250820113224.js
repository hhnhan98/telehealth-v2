// src/services/locationService.js
import axiosInstance from '../utils/axiosInstance';

// ------------------------- Helpers -------------------------
const handleError = (err, context = 'LocationService') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  return {
    success: false,
    message: err.response?.data?.message || 'Có lỗi xảy ra',
    locations: [],
  };
};

const unwrapResponse = (res, defaultData = {}) => {
  if (!res || typeof res !== 'object') return defaultData;
  return res.data?.data || defaultData;
};

// ------------------------- Location APIs -------------------------

// Lấy danh sách tất cả cơ sở y tế
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get('/locations');
    const data = unwrapResponse(res, { locations: [] });
    return { success: res.data?.success, message: res.data?.message, ...data };
  } catch (err) {
    return handleError(err, 'fetchLocations');
  }
};

// ------------------------- Export -------------------------
const locationService = {
  fetchLocations,
};

export default locationService;
