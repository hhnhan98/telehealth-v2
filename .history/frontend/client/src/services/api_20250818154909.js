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

// Lấy thông tin user hiện tại
export const fetchUserProfile = () => axiosInstance.get('/users/me');

// Cập nhật thông tin user (patient/doctor)
export const updateUserProfile = (userId, updatedData) =>
  axiosInstance.put(`/users/${userId}`, updatedData);

// ------------------------- Schedule & Appointment APIs -------------------------

// Lấy lịch làm việc bác sĩ theo ngày
export const fetchDoctorSchedule = (date) =>
  axiosInstance.get(`/schedule/work-schedule?date=${date}`);

// Lấy khung giờ trống của bác sĩ theo ngày
export const fetchAvailableSlots = (doctorId, date) =>
  axiosInstance.get(`/schedule/available/${doctorId}?date=${date}`);

// ------------------------- Export mặc định -------------------------
export default axiosInstance;
