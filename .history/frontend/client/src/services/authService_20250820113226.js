// src/services/authService.js
import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  // ------------------------- Auth APIs -------------------------

  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const result = handleApiResponse(res);

      if (result.success && result.data) {
        localStorage.setItem(TOKEN_KEY, result.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));
      }
      return result;
    } catch (err) {
      return handleApiError(err, 'authService.login');
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return handleApiResponse(res);
    } catch (err) {
      return handleApiError(err, 'authService.register');
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get('/users/profile');
      return handleApiResponse(res);
    } catch (err) {
      return handleApiError(err, 'authService.getProfile');
    }
  },

  // ------------------------- Local Storage Helpers -------------------------

  logoutLocalOnly: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  logout: () => {
    authService.logoutLocalOnly();
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),
};

export default authService;
