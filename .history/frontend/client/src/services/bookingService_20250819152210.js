// src/services/bookingService.js
import axiosInstance from '../utils/axiosInstance';

const BASE_APPOINTMENTS = '/api/appointments';
const BASE_LOCATIONS = '/api/locations';
const BASE_SPECIALTIES = '/api/specialty';
const BASE_DOCTORS = '/api/doctor';

// ------------------------- Helper -------------------------
const validateId = (id) => id && id.trim() !== '' && /^[0-9a-fA-F]{24}$/.test(id);

const handleError = (err, context='') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  throw err.response?.data || err;
};

// ------------------------- Dropdown APIs -------------------------
export const fetchLocations = async () => {
  try {
    const res = await axiosInstance.get(BASE_LOCATIONS);
    return res.data || { success: false, data: [] };
  } catch (err) {
    return handleError(err, 'fetchLocations');
  }
};

export const fetchSpecialties = async (locationId) => {
  if (!validateId(locationId)) return { specialties: [], success: false, message: 'ID cơ sở không hợp lệ' };
  try {
    const res = await axiosInstance.get(`${BASE_SPECIALTIES}?locationId=${locationId}`);
    return res.data || { specialties: [] };
  } catch (err) {
    return handleError(err, 'fetchSpecialties');
  }
};

export const fetchDoctors = async (locationId, specialtyId) => {
  if (!validateId(locationId) || !validateId(specialtyId)) 
    return { doctors: [], success: false, message: 'ID cơ sở hoặc chuyên khoa không hợp lệ' };
  try {
    const res = await axiosInstance.get(`${BASE_DOCTORS}?locationId=${locationId}&specialtyId=${specialtyId}`);
    return res.data || { doctors: [] };
  } catch (err) {
    return handleError(err, 'fetchDoctors');
  }
};

export const fetchAvailableSlots = async (doctorId, date) => {
  if (!validateId(doctorId) || !date) 
    return { availableSlots: [], success: false, message: 'Doctor ID hoặc date không hợp lệ' };
  try {
    const res = await axiosInstance.get(`${BASE_APPOINTMENTS}/available-slots?doctorId=${doctorId}&date=${date}`);
    return res.data || { availableSlots: [] };
  } catch (err) {
    return handleError(err, 'fetchAvailableSlots');
  }
};

// ------------------------- Appointment APIs -------------------------
export const createAppointment = async (appointmentData) => {
  if (!appointmentData) throw new Error('Thiếu dữ liệu đặt lịch');
  try {
    const res = await axiosInstance.post(BASE_APPOINTMENTS, appointmentData);
    return res.data || {};
  } catch (err) {
    return handleError(err, 'createAppointment');
  }
};

export const fetchAppointments = async () => {
  try {
    const res = await axiosInstance.get(BASE_APPOINTMENTS);
    return res.data || [];
  } catch (err) {
    return handleError(err, 'fetchAppointments');
  }
};

export const cancelAppointment = async (appointmentId) => {
  if (!validateId(appointmentId)) throw new Error('Thiếu appointment ID hợp lệ');
  try {
    const res = await axiosInstance.delete(`${BASE_APPOINTMENTS}/${appointmentId}`);
    return res.data || {};
  } catch (err) {
    return handleError(err, 'cancelAppointment');
  }
};

// ------------------------- OTP APIs -------------------------
export const verifyOtp = async (appointmentId, otp) => {
  if (!validateId(appointmentId) || !otp) throw new Error('Thiếu thông tin OTP hợp lệ');
  try {
    const res = await axiosInstance.post(`${BASE_APPOINTMENTS}/verify-otp`, { appointmentId, otp });
    return res.data || {};
  } catch (err) {
    return handleError(err, 'verifyOtp');
  }
};

export const resendOtp = async (appointmentId) => {
  if (!validateId(appointmentId)) throw new Error('Thiếu appointment ID hợp lệ');
  try {
    const res = await axiosInstance.post(`${BASE_APPOINTMENTS}/resend-otp`, { appointmentId });
    return res.data || {};
  } catch (err) {
    return handleError(err, 'resendOtp');
  }
};

// ------------------------- Dashboard & Schedule -------------------------
export const fetchDoctorDashboard = async () => {
  try {
    const res = await axiosInstance.get('/api/doctor/dashboard');
    return res.data || {};
  } catch (err) {
    return handleError(err, 'fetchDoctorDashboard');
  }
};

export const fetchDoctorSchedule = async (dateRange) => {
  try {
    const res = await axiosInstance.get(`/api/doctor/schedule?range=${dateRange}`);
    return res.data || { appointments: [] };
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

// import axiosInstance from './api';

// const BASE_URL = '/appointments';

// // ------------------------- Dropdown APIs -------------------------

// // Lấy danh sách cơ sở y tế
// export const fetchLocations = async () => {
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/locations`);
//     console.log('fetchLocations response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchLocations error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Lấy danh sách chuyên khoa theo cơ sở
// export const fetchSpecialties = async (locationId) => {
//   if (!locationId) return { specialties: [] };
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/specialties?locationId=${locationId}`);
//     console.log('fetchSpecialties response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchSpecialties error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Lấy danh sách bác sĩ theo cơ sở + chuyên khoa
// export const fetchDoctors = async (locationId, specialtyId) => {
//   if (!locationId || !specialtyId) return { doctors: [] };
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/doctors?locationId=${locationId}&specialtyId=${specialtyId}`);
//     console.log('fetchDoctors response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchDoctors error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Lấy khung giờ trống
// export const fetchAvailableSlots = async (doctorId, date) => {
//   if (!doctorId || !date) return { availableSlots: [] };
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/available-slots?doctorId=${doctorId}&date=${date}`);
//     console.log('fetchAvailableSlots response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchAvailableSlots error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // ------------------------- Create Appointment -------------------------

// // Tạo lịch hẹn mới (chỉ user đã login)
// export const createAppointment = async (appointmentData) => {
//   if (!appointmentData) throw new Error('Thiếu dữ liệu đặt lịch');

//   try {
//     console.log('--- CREATE APPOINTMENT PAYLOAD TO BE SENT ---');
//     console.log(appointmentData);

//     const response = await axiosInstance.post(`${BASE_URL}`, appointmentData);
    
//     console.log('--- RESPONSE FROM BACKEND ---');
//     console.log(response.data);

//     return response.data;
//   } catch (error) {
//     console.error('--- CREATE APPOINTMENT ERROR (FE) ---');
//     if (error.response) {
//       console.error('Status:', error.response.status);
//       console.error('Data:', error.response.data);
//     } else {
//       console.error(error.message);
//     }
//     throw error;
//   }
// };

// // ------------------------- OTP APIs -------------------------

// // Xác thực OTP
// export const verifyOtp = async (appointmentId, otp) => {
//   if (!appointmentId || !otp) throw new Error('Thiếu thông tin OTP');
//   try {
//     const res = await axiosInstance.post(`${BASE_URL}/verify-otp`, { appointmentId, otp });
//     console.log('verifyOtp response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('verifyOtp error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Gửi lại OTP
// export const resendOtp = async (appointmentId) => {
//   if (!appointmentId) throw new Error('Thiếu appointment ID');
//   try {
//     const res = await axiosInstance.post(`${BASE_URL}/resend-otp`, { appointmentId });
//     console.log('resendOtp response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('resendOtp error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // ------------------------- Cancel Appointment -------------------------

// export const cancelAppointment = async (id) => {
//   if (!id) throw new Error('Thiếu appointment ID');
//   try {
//     const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
//     console.log('cancelAppointment response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('cancelAppointment error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // ------------------------- Fetch Appointments -------------------------

// // Lấy danh sách lịch hẹn của user hiện tại
// export const fetchAppointments = async () => {
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}`);
//     console.log('fetchAppointments response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchAppointments error:', err.response?.data || err.message);
//     throw err;
//   }
// };
