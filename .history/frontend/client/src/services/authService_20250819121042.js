// src/services/authService.js
import api from '../utils/axiosInstance';

const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
export const register = async (data) => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data;
};

export default authService;
