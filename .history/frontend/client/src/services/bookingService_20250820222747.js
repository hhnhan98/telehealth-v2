// services/bookingService.js
import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const validateId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

// ------------------------- Fetch Locations -------------------------
const fetchLocations = async () => {
  try {
    const res = await api.get('/appointments/locations');
    return Array.isArray(res?.data?.data?.locations) ? res.data.data.locations : [];
  } catch (err) {
    console.error('Error [fetchLocations]:', err);
    return [];
  }
};

// ------------------------- Fetch Specialties -------------------------
const fetchSpecialties = async (locationId) => {
  if (!validateId(locationId)) return [];
  try {
    const res = await api.get('/appointments/specialties', { params: { locationId } });
    return Array.isArray(res?.data?.data?.specialties) ? res.data.data.specialties : [];
  } catch (err) {
    console.error('Error [fetchSpecialties]:', err);
    return [];
  }
};

// ------------------------- Fetch Doctors -------------------------
const fetchDoctors = async (locationId, specialtyId) => {
  if (!validateId(locationId) || !validateId(specialtyId)) return [];
  try {
    const res = await api.get('/appointments/doctors', { params: { locationId, specialtyId } });
    return Array.isArray(res?.data?.data?.doctors) ? res.data.data.doctors : [];
  } catch (err) {
    console.error('Error [fetchDoctors]:', err);
    return [];
  }
};

// ------------------------- Fetch Available Slots -------------------------
const fetchAvailableSlots = async (doctorId, date) => {
  if (!validateId(doctorId)) return [];
  try {
    const res = await api.get('/appointments/available-slots', { params: { doctorId, date } });
    return Array.isArray(res?.data?.data?.availableSlots) ? res.data.data.availableSlots : [];
  } catch (err) {
    console.error('Error [fetchAvailableSlots]:', err);
    return [];
  }
};

// ------------------------- Appointment Actions -------------------------
const createAppointment = async (payload) => {
  try {
    const res = await api.post('/appointments', payload);
    return handleApiResponse(res); // giữ nguyên để lấy appointment object
  } catch (err) {
    return handleApiError(err, 'createAppointment');
  }
};

const cancelAppointment = async (appointmentId) => {
  if (!validateId(appointmentId)) return { success: false };
  try {
    const res = await api.delete(`/appointments/${appointmentId}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'cancelAppointment');
  }
};

const getAppointments = async () => {
  try {
    const res = await api.get('/appointments'); 
    const appointments = Array.isArray(res?.data?.data?.appointments) ? res.data.data.appointments : [];

    return appointments.map(appt => ({
      _id: appt._id,
      datetime: appt.datetime,
      location: appt.location || { name: '-' },
      specialty: appt.specialty || { name: '-' },
      doctor: appt.doctor || { fullName: '-' },
      reason: appt.reason || '-',
      status: appt.status || 'pending'
    }));
  } catch (err) {
    console.error('Error [getAppointments]:', err);
    return [];
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
  getAppointments,
  verifyOtp,
  resendOtp,
};

export default bookingService;
