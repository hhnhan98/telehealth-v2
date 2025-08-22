import axiosInstance from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

// ------------------------- Patient APIs -------------------------

// Lấy thông tin cá nhân (profile) của bệnh nhân đang đăng nhập
export const getMyProfile = async () => {
  try {
    const res = await axiosInstance.get('/patients/me');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getMyProfile');
  }
};

// Cập nhật thông tin cá nhân bệnh nhân
export const updateProfile = async (updatedData) => {
  try {
    const res = await axiosInstance.put('/patients/me', updatedData);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'updateProfile');
  }
};

// Admin: lấy danh sách bệnh nhân (có filter optional)
export const getPatients = async (filter = {}) => {
  try {
    const res = await axiosInstance.get('/patients', { params: filter });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getPatients');
  }
};

// Admin: lấy chi tiết 1 bệnh nhân theo id
export const getPatientById = async (id) => {
  try {
    const res = await axiosInstance.get(`/patients/${id}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getPatientById');
  }
};

// Admin: xóa bệnh nhân theo id
export const deletePatient = async (id) => {
  try {
    const res = await axiosInstance.delete(`/patients/${id}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'deletePatient');
  }
};

const patientService = {
  getMyProfile,
  updateProfile,
  getPatients,
  getPatientById,
  deletePatient,
};

export default patientService;
