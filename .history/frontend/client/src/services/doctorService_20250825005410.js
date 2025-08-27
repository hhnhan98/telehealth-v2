import axiosInstance from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

// ------------------------- Doctor APIs -------------------------

export const getMyProfile = async () => {
  try {
    const res = await axiosInstance.get('/doctors/me');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getMyProfile');
  }
};

export const updateProfile = async (updatedData) => {
  try {
    const res = await axiosInstance.put('/doctors/me', updatedData);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'updateProfile');
  }
};

// Lấy danh sách bác sĩ theo specialty hoặc location
export const getDoctors = async (filter = {}) => {
  try {
    const res = await axiosInstance.get('/users/doctors', { params: filter });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getDoctors');
  }
};

export const fetchDashboard = async () => {
  try {
    const res = await axiosInstance.get('/doctor/dashboard');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchDashboard');
  }
};

const doctorService = {
  getMyProfile,
  updateProfile,
  getDoctors,
};

export default doctorService;
