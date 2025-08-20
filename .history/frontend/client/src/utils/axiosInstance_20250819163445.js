import axios from 'axios';

// Tạo instance Axios chung cho toàn FE
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // Timeout 10 giây
});

// Thêm token tự động vào header Authorization nếu có token trong localStorage
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Xử lý lỗi 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Xoá token hết hạn
      window.location.href = '/login'; // Chuyển về trang login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
