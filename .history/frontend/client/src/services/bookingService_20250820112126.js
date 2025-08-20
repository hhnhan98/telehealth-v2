// src/services/bookingService.js
import axiosInstance from '../utils/axiosInstance';

const BASE = '/appointments';

// ------------------------- Helper -------------------------
const validateId = (id) =>
  id && id.trim() !== '' && /^[0-9a-fA-F]{24}$/.test(id);

const handleError = (err, context = '') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  throw err.response?.data || err;
};

// ------------------------- Dropdown APIs -------------------------
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get(`${BASE}/locations`);
    return res.data || { success: false, data: [] };
  } catch (err) {
    return handleError(err, 'fetchLocations');
  }
};

export const fetchSpecialties = async (locationId) => {
  if (!validateId(locationId))
    return {
      specialties: [],
      success: false,
      message: 'ID cơ sở không hợp lệ',
    };

  try {
    const res = await axiosInstance.get(
      `${BASE}/specialties?locationId=${locationId}`
    );
    return res.data || { specialties: [] };
  } catch (err) {
    return handleError(err, 'fetchSpecialties');
  }
};

export const fetchDoctors = async (locationId, specialtyId) => {
  if (!validateId(locationId) || !validateId(specialtyId)) {
    console.warn('[fetchDoctors] ID không hợp lệ:', { locationId, specialtyId });
    return {
      doctors: [],
      success: false,
      message: 'ID cơ sở hoặc chuyên khoa không hợp lệ',
    };
  }

  try {
    console.log('[fetchDoctors] Gửi request với:', { locationId, specialtyId });
    const res = await axiosInstance.get(
      `${BASE}/doctors?locationId=${locationId}&specialtyId=${specialtyId}`
    );

    console.log('[fetchDoctors] Response.data:', res.data);

    const doctorsList = Array.isArray(res.data?.doctors) ? res.data.doctors : [];
    return {
      doctors: doctorsList,
      success: res.data?.success ?? !!doctorsList.length,
      message: res.data?.message || '',
    };
  } catch (err) {
    console.error('[fetchDoctors] Lỗi khi fetch:', err.response?.data || err.message || err);
    return { doctors: [], success: false, message: 'Lỗi khi lấy danh sách bác sĩ' };
  }
};
