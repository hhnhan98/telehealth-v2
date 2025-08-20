// src/services/userService.js
import axiosInstance from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

// ------------------------- User Profile APIs -------------------------

// Lấy thông tin user hiện tại
export const fetchUserProfile = async () => {
  try {
    const res = await axiosInstance.get('/users/me');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchUserProfile');
  }
};

// Cập nhật hồ sơ cá nhân
export const updateMyProfile = async (updatedData) => {
  try {
    const res = await axiosInstance.put('/users/me', updatedData);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'updateMyProfile');
  }
};

// ------------------------- Admin / User Management APIs -------------------------

// Lấy danh sách tất cả user (dành cho admin)
export const fetchAllUsers = async (queryParams = {}) => {
  try {
    const query = new URLSearchParams(queryParams).toString();
    const res = await axiosInstance.get(`/users${query ? '?' + query : ''}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchAllUsers');
  }
};

// Lấy danh sách bác sĩ theo chuyên khoa
export const fetchDoctorsBySpecialty = async (specialty) => {
  if (!specialty) {
    return { success: false, data: [], message: 'Specialty is required' };
  }
  try {
    const res = await axiosInstance.get(`/users/doctors?specialty=${specialty}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchDoctorsBySpecialty');
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
