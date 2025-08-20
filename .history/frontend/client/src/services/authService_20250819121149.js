// src/services/authService.js
import api from '../utils/axiosInstance';

const authService = {
  // --- Đăng nhập ---
  login: async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (err) {
      throw err.response?.data || { message: 'Lỗi đăng nhập!' };
    }
  },

  // --- Đăng ký ---
  register: async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return data;
    } catch (err) {
      throw err.response?.data || { message: 'Lỗi đăng ký!' };
    }
  },

  // --- Lấy thông tin hồ sơ ---
  getProfile: async () => {
    try {
      const { data } = await api.get('/users/profile');
      return data;
    } catch (err) {
      throw err.response?.data || { message: 'Không thể tải hồ sơ!' };
    }
  },

  // --- Đăng xuất ---
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

export default authService;
