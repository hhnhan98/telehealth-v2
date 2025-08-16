import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // Timeout 10 giây
});

// Thêm token tự động vào header Authorization nếu có token trong localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response lỗi 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xoá token khỏi localStorage khi token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      // Chuyển hướng về trang đăng nhập để người dùng đăng nhập lại
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
