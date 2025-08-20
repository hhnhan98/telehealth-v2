import api from '../utils/axiosInstance';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
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

  // Chỉ xóa token + user, không redirect
  logoutLocalOnly: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Nếu muốn redirect trực tiếp (ít dùng trong SPA)
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
