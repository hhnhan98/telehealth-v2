// src/services/api.js
import axios from 'axios';

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

// ====================== USER ======================
// Lấy thông tin hiện tại
export const fetchCurrentUser = () => axiosInstance.get('/users/me');

// Cập nhật hồ sơ người dùng
export const updateUserProfile = (userId, data) =>
  axiosInstance.put(`/users/${userId}`, data);

// ====================== DOCTOR SCHEDULE ======================
// Lấy lịch làm việc của bác sĩ
export const fetchDoctorSchedule = (doctorId, date) =>
  axiosInstance.get(`/schedule/work-schedule/${doctorId}?date=${date}`);

// Lấy slot trống của bác sĩ cho ngày cụ thể
export const fetchAvailableSlots = (doctorId, date) =>
  axiosInstance.get(`/schedule/available/${doctorId}?date=${date}`);

// ====================== BOOKING ======================
// Tạo lịch hẹn
export const createAppointment = (data) =>
  axiosInstance.post('/appointments', data);

// Xác thực OTP
export const verifyOtp = (appointmentId, otp) =>
  axiosInstance.post(`/appointments/${appointmentId}/verify-otp`, { otp });

// Gửi lại OTP
export const resendOtp = (appointmentId) =>
  axiosInstance.post(`/appointments/${appointmentId}/resend-otp`);

// ====================== LOCATION / SPECIALTY / DOCTOR ======================
// Lấy danh sách cơ sở y tế
export const fetchLocations = () =>
  axiosInstance.get('/locations');

// Lấy danh sách chuyên khoa theo location
export const fetchSpecialties = (locationId) =>
  axiosInstance.get(`/specialties?locationId=${locationId}`);

// Lấy danh sách bác sĩ theo location và chuyên khoa
export const fetchDoctors = (locationId, specialtyId) =>
  axiosInstance.get(`/doctors?locationId=${locationId}&specialtyId=${specialtyId}`);

// ====================== EXPORT DEFAULT ======================
export default axiosInstance;
