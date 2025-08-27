import axios from 'axios';

// ------------------------- Axios Instance -------------------------
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Thêm token tự động từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý lỗi chung
api.interceptors.response.use(
  (response) => response.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Lỗi server';
    return Promise.reject(new Error(message));
  }
);

// ------------------------- User APIs -------------------------
export const getMyProfile = () => api.get('/users/me');
export const updateMyProfile = (data) => api.put('/users/me', data);
export const getAllUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getDoctorsBySpecialty = (params) => api.get('/users/doctors', { params });

// ------------------------- Schedule & Appointment APIs -------------------------
export const fetchDoctorSchedule = (view = 'day') =>
  api.get('/doctor/work-schedule', { params: { view } });

export const fetchAvailableSlots = (doctorId, date) =>
  api.get('/appointments/available-slots', { params: { doctorId, date } });

export const createAppointment = (data) => api.post('/appointments', data);
export const fetchAppointments = () => api.get('/appointments');
export const cancelAppointment = (appointmentId) => api.delete(`/appointments/${appointmentId}`);
export const verifyOtp = (appointmentId, otp) =>
  api.post('/appointments/verify-otp', { appointmentId, otp });
export const resendOtp = (appointmentId) =>
  api.post('/appointments/resend-otp', { appointmentId });

// ------------------------- Dropdown APIs -------------------------
export const getLocations = () => api.get('/appointments/locations');
export const getSpecialtiesByLocation = (locationId) =>
  api.get('/appointments/specialties', { params: { locationId } });
export const getDoctorsBySpecialtyAndLocation = (specialtyId, locationId) =>
  api.get('/appointments/doctors', { params: { specialtyId, locationId } });

// ------------------------- Export mặc định -------------------------
export default api;