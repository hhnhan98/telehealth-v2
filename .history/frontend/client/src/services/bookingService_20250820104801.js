// src/services/bookingService.js
import axiosInstance from '../utils/axiosInstance';

const handleError = (err, fnName) => {
  console.error(`[${fnName}] Error:`, err.response?.data || err.message);
  return null;
};

// 1. Lấy danh sách cơ sở
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get('/locations');
    console.log('[fetchLocations] Response:', res.data);
    return res.data?.data || [];
  } catch (err) {
    return handleError(err, 'fetchLocations');
  }
};

// 2. Lấy danh sách chuyên khoa
export const fetchSpecialties = async () => {
  try {
    const res = await axiosInstance.get('/specialties');
    console.log('[fetchSpecialties] Response:', res.data);
    return res.data?.data || [];
  } catch (err) {
    return handleError(err, 'fetchSpecialties');
  }
};

// 3. Lấy danh sách bác sĩ theo location + specialty
export const fetchDoctors = async (params) => {
  try {
    const res = await axiosInstance.post('/doctors/by-specialty-location', params);
    console.log('[fetchDoctors] Response:', res.data);
    return res.data?.data || { doctors: [], count: 0 };
  } catch (err) {
    return handleError(err, 'fetchDoctors');
  }
};

// 4. Lấy danh sách slot trống của bác sĩ theo ngày
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const res = await axiosInstance.get(`/schedules/${doctorId}/available-slots`, {
      params: { date },
    });
    console.log('[getAvailableSlots] Response:', res.data);
    return res.data?.data || { availableSlots: [] };
  } catch (err) {
    return handleError(err, 'getAvailableSlots');
  }
};

// 5. Đặt lịch khám
export const createAppointment = async (payload) => {
  try {
    const res = await axiosInstance.post('/appointments', payload);
    console.log('[createAppointment] Response:', res.data);
    return res.data;
  } catch (err) {
    return handleError(err, 'createAppointment');
  }
};
