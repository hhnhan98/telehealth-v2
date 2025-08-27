import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';
import { formatVN } from '../utils/timezone';

// Kiểm tra ObjectId hợp lệ
const validateId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

// ===================== Fetch Locations =====================
const fetchLocations = async () => {
  try {
    const res = await api.get('/appointments/locations');
    return Array.isArray(res?.data?.data?.locations) ? res.data.data.locations : [];
  } catch (err) {
    console.error('Error [fetchLocations]:', err);
    return [];
  }
};

// ===================== Fetch Specialties =====================
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

// ===================== Fetch Doctors =====================
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

// ===================== Fetch Available Slots =====================
const fetchAvailableSlots = async (doctorId, date) => {
  if (!validateId(doctorId) || !date) return [];
  try {
    const res = await api.get('/appointments/available-slots', { params: { doctorId, date } });

    const rawSlots = Array.isArray(res?.data?.data?.availableSlots) ? res.data.data.availableSlots : [];
    
return rawSlots.map(slot => {
  // Nếu slot là string thì dùng trực tiếp, nếu là object thì lấy .time
  const timeStr = typeof slot === 'string' ? slot : slot?.time || '';
  
  // Chuyển sang định dạng VN nếu chưa có
  const datetimeVN = slot?.datetimeVN || formatVN(timeStr);
  
  // Hiển thị trên dropdown
  const displayTime = datetimeVN;

  return { time: timeStr, displayTime, datetimeVN };
});

  } catch (err) {
    console.error('Error [fetchAvailableSlots]:', err);
    return [];
  }
};

// ===================== Create Appointment =====================
const createAppointment = async (payload) => {
  try {
    const res = await api.post('/appointments', payload);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'createAppointment');
  }
};

// ===================== Cancel Appointment =====================
const cancelAppointment = async (appointmentId) => {
  if (!validateId(appointmentId)) return { success: false };
  try {
    const res = await api.delete(`/appointments/${appointmentId}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'cancelAppointment');
  }
};

// ===================== Get All Appointments =====================
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

// ===================== Get Appointment By ID =====================
const getAppointmentById = async (id) => {
  if (!validateId(id)) return null;
  try {
    const res = await api.get(`/appointments/${id}`);
    return res.data?.data || null;
  } catch (err) {
    console.error('Error [getAppointmentById]:', err);
    return null;
  }
};

// ===================== OTP Verification =====================
const verifyOtp = async (appointmentId, otp) => {
  if (!validateId(appointmentId) || !otp) return { success: false };
  try {
    const res = await api.post('/appointments/verify-otp', { appointmentId, otp });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'verifyOtp');
  }
};

const resendOtp = async (appointmentId) => {
  if (!validateId(appointmentId)) return { success: false };
  try {
    const res = await api.post('/appointments/resend-otp', { appointmentId });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'resendOtp');
  }
};

// ===================== Export =====================
const bookingService = {
  fetchLocations,
  fetchSpecialties,
  fetchDoctors,
  fetchAvailableSlots,
  createAppointment,
  cancelAppointment,
  getAppointments,
  getAppointmentById,
  verifyOtp,
  resendOtp,
};

export default bookingService;
