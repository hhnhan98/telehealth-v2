import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const login = async (credentials) => {
  try {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.success) {
      localStorage.setItem(TOKEN_KEY, res.data.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.data.user));
    }
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'login');
  }
};

const register = async (userData) => {
  try {
    const res = await api.post('/auth/register', userData);
    return handleApiResponse(res);
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
