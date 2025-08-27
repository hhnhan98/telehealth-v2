// src/services/authService.js
import api from '../utils/axiosInstance';
import { handleApiError } from '../utils/apiHelpers';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Login user
 * @param {Object} credentials { email, password }
 */
const login = async (credentials) => {
  try {
    // Chuẩn hóa input trước khi gửi
    const email = String(credentials.email || '').trim().toLowerCase();
    const password = String(credentials.password || '').trim();

    const res = await api.post('/auth/login', { email, password });

    const { token, user } = res.data.data;

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

// Register user
const register = async (userData) => {
  try {
    // Chuẩn hóa input trước khi gửi
    const payload = {
      fullName: String(userData.fullName || '').trim(),
      email: String(userData.email || '').trim().toLowerCase(),
      password: String(userData.password || '').trim(),
      role: userData.role,
      ...(userData.role === 'doctor' && {
        specialty: userData.specialty,
        location: userData.location,
      }),
    };

    const res = await api.post('/auth/register', payload);

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

/**
 * Get current logged in user from localStorage
 */
const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Get current JWT token from localStorage
 */
const getToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Logout locally (remove token & user)
 */
const logoutLocalOnly = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Logout user and redirect to login
 */
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
