// src/services/userService.js
import axiosInstance from './api';

// ------------------------- User Profile -------------------------

// Lấy thông tin user hiện tại
export const fetchUserProfile = async () => {
  try {
    const res = await axiosInstance.get('/users/me');
    return res.data;
  } catch (err) {
    console.error('fetchUserProfile error:', err.response?.data || err.message);
    throw err;
  }
};

// Cập nhật hồ sơ cá nhân
export const updateMyProfile = async (updatedData) => {
  try {
    const res = await axiosInstance.put('/users/me', updatedData);
    return res.data;
  } catch (err) {
    console.error('updateMyProfile error:', err.response?.data || err.message);
    throw err;
  }
};

// ------------------------- Admin / User Management -------------------------

// Lấy danh sách tất cả user (admin)
export const fetchAllUsers = async (queryParams = {}) => {
  try {
    const query = new URLSearchParams(queryParams).toString();
    const res = await axiosInstance.get(`/users${query ? '?' + query : ''}`);
    return res.data;
  } catch (err) {
    console.error('fetchAllUsers error:', err.response?.data || err.message);
    throw err;
  }
};

// Lấy danh sách bác sĩ theo chuyên khoa
export const fetchDoctorsBySpecialty = async (specialty) => {
  if (!specialty) return { doctors: [] };
  try {
    const res = await axiosInstance.get(`/users/doctors?specialty=${specialty}`);
    return res.data;
  } catch (err) {
    console.error('fetchDoctorsBySpecialty error:', err.response?.data || err.message);
    throw err;
  }
};

// ------------------------- Export -------------------------
const userService = {
  fetchUserProfile,
  updateMyProfile,
  fetchAllUsers,
  fetchDoctorsBySpecialty,
};

export default userService;
