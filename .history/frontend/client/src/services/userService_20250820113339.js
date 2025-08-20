import axiosInstance from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

// ------------------------- User APIs -------------------------

export const fetchUserProfile = async () => {
  try {
    const res = await axiosInstance.get('/users/me');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchUserProfile');
  }
};

export const updateMyProfile = async (updatedData) => {
  try {
    const res = await axiosInstance.put('/users/me', updatedData);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'updateMyProfile');
  }
};

export const fetchAllUsers = async (queryParams = {}) => {
  try {
    const res = await axiosInstance.get('/users', { params: queryParams });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchAllUsers');
  }
};

export const fetchDoctorsBySpecialty = async (specialtyId) => {
  if (!specialtyId) return { success: false, data: null, message: 'Thiếu specialtyId' };
  try {
    const res = await axiosInstance.get('/users/doctors', { params: { specialty: specialtyId } });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchDoctorsBySpecialty');
  }
};

export default {
  fetchUserProfile,
  updateMyProfile,
  fetchAllUsers,
  fetchDoctorsBySpecialty,
};
