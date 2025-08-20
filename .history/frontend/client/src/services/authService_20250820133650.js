import api from '../utils/axiosInstance';
import { handleApiError } from '../utils/apiHelpers';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const login = async (credentials) => {
  try {
    const res = await api.post('/auth/login', credentials);

    const { token, user } = res.data;

    if (!token || !user) {
      return { success: false, message: 'Đăng nhập thất bại' };
    }

    // Lưu token & user vào localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { success: true, user, token };
  } catch (err) {
    return handleApiError(err, 'login');
  }
};

const register = async (userData) => {
  try {
    const res = await api.post('/auth/register', userData);
    const { id, fullName, email, role, specialty } = res.data || {};
    return {
      success: !!res.data,
      message: res.data ? 'Đăng ký thành công' : 'Đăng ký thất bại',
      user: { id, fullName, email, role, specialty: specialty || null },
    };
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
