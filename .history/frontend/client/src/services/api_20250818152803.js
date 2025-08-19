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

// Các hàm API riêng lẻ
export const fetchDoctorSchedule = date =>
  axiosInstance.get(`/schedule/work-schedule?date=${date}`);

export const fetchAvailableSlots = (doctorId, date) =>
  axiosInstance.get(`/schedule/available/${doctorId}?date=${date}`);

// Export mặc định để service khác dùng
export default axiosInstance;

