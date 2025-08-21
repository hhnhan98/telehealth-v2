import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const validateId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

const fetchLocations = async () => {
  try {
    const res = await api.get('/appointments/locations');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchLocations');
  }
};

const fetchSpecialties = async (locationId) => {
  if (!validateId(locationId)) return { success: false, data: [], message: 'ID cơ sở không hợp lệ' };
  try {
    const res = await api.get('/appointments/specialties', { params: { locationId } });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchSpecialties');
  }
};

const fetchDoctors = async (locationId, specialtyId) => {
  if (!validateId(locationId) || !validateId(specialtyId)) return { success: false, data: [], message: 'ID không hợp lệ' };
  try {
    const res = await api.get('/appointments/doctors', { params: { locationId, specialtyId } });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchDoctors');
  }
};

const fetchAvailableSlots = async (doctorId, date) => {
  if (!validateId(doctorId)) return { success: false, data: [], message: 'ID bác sĩ không hợp lệ' };
  try {
    const res = await api.get('/appointments/available-slots', { params: { doctorId, date } });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchAvailableSlots');
  }
};

const createAppointment = async (payload) => {
  try {
    const res = await api.post('/appointments', payload);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'createAppointment');
  }
};

const cancelAppointment = async (appointmentId) => {
  if (!validateId(appointmentId)) return { success: false, message: 'ID lịch hẹn không hợp lệ' };
  try {
    const res = await api.delete(`/appointments/${appointmentId}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'cancelAppointment');
  }
};

const verifyOtp = async (appointmentId, otp) => {
  try {
    const res = await api.post('/appointments/verify-otp', { appointmentId, otp });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'verifyOtp');
  }
};

const resendOtp = async (appointmentId) => {
  try {
    const res = await api.post('/appointments/resend-otp', { appointmentId });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'resendOtp');
  }
};

const bookingService = {
  fetchLocations,
  fetchSpecialties,
  fetchDoctors,
  fetchAvailableSlots,
  createAppointment,
  cancelAppointment,
  verifyOtp,
  resendOtp,
};

export default bookingService;
