/
import api from '../utils/axiosInstance';
import { handleApiError } from '../utils/apiHelpers';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Login user
const login = async (credentials) => {
  try {
    const email = String(credentials.email || '').trim().toLowerCase();
    const password = String(credentials.password || '').trim();

    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data.data;

    if (!token || !user) {
      return { success: false, message: 'Đăng nhập thất bại' };
    }

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

// Lấy user hiện tại, kiểm tra token hết hạn
const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY);

  if (!userStr || !token) return null;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // seconds
    if (decoded.exp && decoded.exp < now) {
      // Token hết hạn, tự logout
      logoutLocalOnly();
      return null;
    }
    return JSON.parse(userStr);
  } catch (err) {
    // Token invalid, tự logout
    logoutLocalOnly();
    return null;
  }
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

