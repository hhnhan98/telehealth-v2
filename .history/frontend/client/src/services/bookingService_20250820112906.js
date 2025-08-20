// src/services/bookingService.js
import axiosInstance from '../utils/axiosInstance';

const BASE = '/appointments';

// ------------------------- Helpers -------------------------
const validateId = (id) =>
  id && id.trim() !== '' && /^[0-9a-fA-F]{24}$/.test(id);

const handleError = (err, context = '') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  return {
    success: false,
    message: err.response?.data?.message || 'Có lỗi xảy ra',
    data: [],
  };
};

// Chuẩn hoá response từ BE
const unwrapResponse = (res, defaultData = {}) => {
  if (!res || typeof res !== 'object') return defaultData;
  return res.data?.data || defaultData;
};

// ------------------------- Dropdown APIs -------------------------
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get(`${BASE}/locations`);
    const data = unwrapResponse(res, { locations: [] });
    return { success: res.data?.success, message: res.data?.message, ...data };
  } catch (err) {
    return handleError(err, 'fetchLocations');
  }
};

export const fetchSpecialties = async (locationId) => {
  if (!validateId(locationId)) {
    return {
      specialties: [],
      success: false,
      message: 'ID cơ sở không hợp lệ',
    };
  }

  try {
    const res = await axiosInstance.get(
      `${BASE}/specialties?locationId=${locationId}`
    );
    const data = unwrapResponse(res, { specialties: [] });
    return { success: res.data?.success, message: res.data?.message, ...data };
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
    const data = unwrapResponse(res, { doctors: [] });
    return { success: res.data?.success, message: res.data?.message, ...data };
  } catch (err) {
    return handleError(err, 'fetchDoctors');
  }
};

// ------------------------- Booking APIs -------------------------
export const fetchAvailableSlots = async (doctorId, date) => {
  if (!validateId(doctorId)) {
    return {
      slots: [],
      success: false,
      message: 'ID bác sĩ không hợp lệ',
    };
  }

  try {
    const res = await axiosInstance.get(
      `${BASE}/available-slots?doctorId=${doctorId}&date=${date}`
    );
    const data = unwrapResponse(res, { slots: [] });
    return { success: res.data?.success, message: res.data?.message, ...data };
  } catch (err) {
    return handleError(err, 'fetchAvailableSlots');
  }
};

export const createAppointment = async (payload) => {
  try {
    const res = await axiosInstance.post(`${BASE}/book`, payload);
    const data = unwrapResponse(res, { appointment: null });
    return { success: res.data?.success, message: res.data?.message, ...data };
  } catch (err) {
    return handleError(err, 'createAppointment');
  }
};

export const cancelAppointment = async (appointmentId) => {
  if (!validateId(appointmentId)) {
    return {
      success: false,
      message: 'ID lịch hẹn không hợp lệ',
    };
  }

  try {
    const res = await axiosInstance.delete(`${BASE}/cancel/${appointmentId}`);
    return {
      success: res.data?.success,
      message: res.data?.message,
      ...unwrapResponse(res, {}),
    };
  } catch (err) {
    return handleError(err, 'cancelAppointment');
  }
};
