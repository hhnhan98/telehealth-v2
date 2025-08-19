// src/services/api.js
import axios from 'axios';

// Tạo axios instance chung
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Thêm token tự động từ localStorage
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ------------------------- User APIs -------------------------

// User APIs
export const fetchUserProfile = () => axiosInstance.get('/users/me');
export const updateMyProfile = (updatedData) => axiosInstance.put('/users/me', updatedData);

// ------------------------- Schedule & Appointment APIs -------------------------

// Lấy lịch làm việc bác sĩ theo ngày
export const fetchDoctorSchedule = (date) =>
  axiosInstance.get(`/schedule/work-schedule?date=${date}`);

// Lấy khung giờ trống của bác sĩ theo ngày
export const fetchAvailableSlots = (doctorId, date) =>
  axiosInstance.get(`/schedule/available/${doctorId}?date=${date}`);

// Tạo lịch hẹn mới
export const createAppointment = (appointmentData) =>
  axiosInstance.post('/appointments', appointmentData);

// Lấy danh sách lịch hẹn của user hiện tại
export const fetchAppointments = () =>
  axiosInstance.get('/appointments');

// Hủy lịch hẹn
export const cancelAppointment = (appointmentId) =>
  axiosInstance.delete(`/appointments/${appointmentId}`);

// Xác thực OTP
export const verifyOtp = (appointmentId, otp) =>
  axiosInstance.post('/appointments/verify-otp', { appointmentId, otp });

// Gửi lại OTP
export const resendOtp = (appointmentId) =>
  axiosInstance.post('/appointments/resend-otp', { appointmentId });

// ------------------------- Export mặc định -------------------------
export default axiosInstance;
