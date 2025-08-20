// src/services/bookingService.js
import axiosInstance from '../utils/axiosInstance';

const BASE_APPOINTMENTS = '/appointments';
const BASE_LOCATIONS = '/locations';
const BASE_SPECIALTIES = '/specialties';
const BASE_DOCTORS = '/appointments/doctors';

// ------------------------- Helper -------------------------
const validateId = (id) => id && id.trim() !== '' && /^[0-9a-fA-F]{24}$/.test(id);

const handleError = (err, context = '') => {
  console.error(`[bookingService] ${context} error:`, err.response?.data || err.message || err);
  return { success: false, message: err.response?.data?.message || err.message || 'Lỗi không xác định' };
};

// ------------------------- Dropdown APIs -------------------------
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get(BASE_LOCATIONS);
    console.log('[fetchLocations] Response:', res.data);
    return res.data || { success: false, data: [] };
  } catch (err) {
    return handleError(err, 'fetchLocations');
  }
};

export const fetchSpecialties = async (locationId) => {
  if (!validateId(locationId)) return { specialties: [], success: false, message: 'ID cơ sở không hợp lệ' };
  try {
    const res = await axiosInstance.get(`${BASE_SPECIALTIES}?locationId=${locationId}`);
    console.log('[fetchSpecialties] Response:', res.data);
    return res.data || { specialties: [] };
  } catch (err) {
    return handleError(err, 'fetchSpecialties');
  }
};

export const fetchDoctors = async (locationId, specialtyId) => {
  if (!validateId(locationId) || !validateId(specialtyId)) {
    console.warn('[fetchDoctors] ID không hợp lệ:', { locationId, specialtyId });
    return { doctors: [], success: false, message: 'ID cơ sở hoặc chuyên khoa không hợp lệ' };
  }

  try {
    console.log('[fetchDoctors] Sending request with:', { locationId, specialtyId });
    const res = await axiosInstance.get(`${BASE_DOCTORS}?locationId=${locationId}&specialtyId=${specialtyId}`);
    console.log('[fetchDoctors] Response.data:', res.data);

    const doctorsList = Array.isArray(res.data?.doctors) ? res.data.doctors : [];
    return {
      doctors: doctorsList,
      success: res.data?.success ?? true,
      message: res.data?.message || '',
    };
  } catch (err) {
    console.error('[fetchDoctors] Fetch error:', err.response?.data || err.message || err);
    return { doctors: [], success: false, message: 'Lỗi khi lấy danh sách bác sĩ' };
  }
};

export const fetchAvailableSlots = async (doctorId, date) => {
  if (!validateId(doctorId) || !date) return { availableSlots: [], success: false, message: 'Doctor ID hoặc date không hợp lệ' };
  try {
    const res = await axiosInstance.get(`${BASE_APPOINTMENTS}/available-slots?doctorId=${doctorId}&date=${date}`);
    console.log('[fetchAvailableSlots] Response:', res.data);
    return res.data || { availableSlots: [] };
  } catch (err) {
    return handleError(err, 'fetchAvailableSlots');
  }
};

// ------------------------- Appointment APIs -------------------------
export const createAppointment = async (appointmentData) => {
  if (!appointmentData) return { success: false, message: 'Thiếu dữ liệu đặt lịch' };
  try {
    const res = await axiosInstance.post(BASE_APPOINTMENTS, appointmentData);
    console.log('[createAppointment] Response:', res.data);
    return res.data || { success: false };
  } catch (err) {
    return handleError(err, 'createAppointment');
  }
};

export const fetchAppointments = async () => {
  try {
    const res = await axiosInstance.get(BASE_APPOINTMENTS);
    console.log('[fetchAppointments] Response:', res.data);
    return res.data || { appointments: [], success: true };
  } catch (err) {
    return handleError(err, 'fetchAppointments');
  }
};

export const cancelAppointment = async (appointmentId) => {
  if (!validateId(appointmentId)) return { success: false, message: 'Thiếu appointment ID hợp lệ' };
  try {
    const res = await axiosInstance.delete(`${BASE_APPOINTMENTS}/${appointmentId}`);
    console.log('[cancelAppointment] Response:', res.data);
    return res.data || { success: false };
  } catch (err) {
    return handleError(err, 'cancelAppointment');
  }
};

// ------------------------- OTP APIs -------------------------
export const verifyOtp = async (appointmentId, otp) => {
  if (!validateId(appointmentId) || !otp) return { success: false, message: 'Thiếu thông tin OTP hợp lệ' };
  try {
    const res = await axiosInstance.post(`${BASE_APPOINTMENTS}/verify-otp`, { appointmentId, otp });
    console.log('[verifyOtp] Response:', res.data);
    return res.data || { success: false };
  } catch (err) {
    return handleError(err, 'verifyOtp');
  }
};

export const resendOtp = async (appointmentId) => {
  if (!validateId(appointmentId)) return { success: false, message: 'Thiếu appointment ID hợp lệ' };
  try {
    const res = await axiosInstance.post(`${BASE_APPOINTMENTS}/resend-otp`, { appointmentId });
    console.log('[resendOtp] Response:', res.data);
    return res.data || { success: false };
  } catch (err) {
    return handleError(err, 'resendOtp');
  }
};

// ------------------------- Dashboard & Schedule -------------------------
export const fetchDoctorDashboard = async () => {
  try {
    const res = await axiosInstance.get('/doctor/dashboard');
    console.log('[fetchDoctorDashboard] Response:', res.data);
    return res.data || { success: true };
  } catch (err) {
    return handleError(err, 'fetchDoctorDashboard');
  }
};

export const fetchDoctorSchedule = async (dateRange) => {
  try {
    const res = await axiosInstance.get(`/doctor/schedule?range=${dateRange}`);
    console.log('[fetchDoctorSchedule] Response:', res.data);
    return res.data || { appointments: [], success: true };
  } catch (err) {
    return handleError(err, 'fetchDoctorSchedule');
  }
};

// ------------------------- Export -------------------------
const bookingService = {
  fetchLocations,
  fetchSpecialties,
  fetchDoctors,
  fetchAvailableSlots,
  createAppointment,
  fetchAppointments,
  cancelAppointment,
  verifyOtp,
  resendOtp,
  fetchDoctorDashboard,
  fetchDoctorSchedule,
};

export default bookingService;
