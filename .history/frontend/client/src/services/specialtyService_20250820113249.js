// src/services/specialtyService.js
import axiosInstance from '../utils/axiosInstance';

// ------------------------- Helpers -------------------------
const handleError = (err, context = 'SpecialtyService') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  return {
    success: false,
    message: err.response?.data?.message || 'Có lỗi xảy ra',
    specialties: [],
  };
};

const unwrapResponse = (res, defaultData = {}) => {
  if (!res || typeof res !== 'object') return defaultData;
  return res.data?.data || defaultData;
};

// ------------------------- Specialty APIs -------------------------

// Lấy danh sách tất cả chuyên khoa
export const fetchSpecialties = async () => {
  try {
    const res = await axiosInstance.get('/specialties');
    const data = unwrapResponse(res, { specialties: [] });
    return { success: res.data?.success, message: res.data?.message, ...data };
  } catch (err) {
    return handleError(err, 'fetchSpecialties');
  }
};

// Lấy danh sách chuyên khoa theo cơ sở y tế
export const fetchSpecialtiesByLocation = async (locationId) => {
  if (!locationId) {
    return { success: false, message: 'Thiếu locationId', specialties: [] };
  }
  try {
    const res = await axiosInstance.get(`/specialties?locationId=${locationId}`);
    const data = unwrapResponse(res, { specialties: [] });
    return { success: res.data?.success, message: res.data?.message, ...data };
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
