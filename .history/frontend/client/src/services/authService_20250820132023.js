import api from '../utils/axiosInstance';
import { handleApiError } from '../utils/apiHelpers';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const login = async (credentials) => {
  try {
    const res = await api.post('/auth/login', credentials);

    const { success, message, data } = res.data;

    if (success && data?.token && data?.user) {
      // Lưu token & user vào localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success, message, user: data.user, token: data.token };
    }

    return { success: false, message: message || 'Đăng nhập thất bại' };
  } catch (err) {
    return handleApiError(err, 'login');
  }
};

const register = async (userData) => {
  try {
    const res = await api.post('/auth/register', userData);
    const { success, message, data } = res.data;
    return { success, message, user: data || null };
  } catch (err) {
    return handleApiError(err, 'register');
  }
};

const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const logoutLocalOnly = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const logout = () => {
  logoutLocalOnly();
  window.location.href = '/login';
};

const authService = {
  login,
  register,
  getCurrentUser,
  getToken,
  logoutLocalOnly,
  logout,
};

export default authService;
