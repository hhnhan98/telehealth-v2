import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // sửa lại nếu khác
});

// Gửi token từ localStorage (giả sử đã login)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Lấy lịch làm việc của bác sĩ theo ngày
export const fetchDoctorSchedule = (date) =>
  API.get(`/schedule/work-schedule?date=${date}`);

// Lấy khung giờ trống theo ngày
export const fetchAvailableSlots = (doctorId, date) =>
  API.get(`/schedule/available/${doctorId}?date=${date}`);
