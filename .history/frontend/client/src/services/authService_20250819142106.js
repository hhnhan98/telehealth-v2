import api from '../utils/axiosInstance';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);

      if (res.data.success) {
        const { token, user } = res.data.data; // backend trả data: { token, user }
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (err) {
      // Trả về message dễ hiển thị
      throw new Error(err.response?.data?.message || err.message);
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) return res.data.data; // data chứa user info hoặc id
      throw new Error(res.data.message || 'Register failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) return res.data.data;
      throw new Error(res.data.message || 'Fetch profile failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  },

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
