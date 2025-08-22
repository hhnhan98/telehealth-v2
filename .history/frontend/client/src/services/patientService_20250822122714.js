// src/services/patientService.js
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

// Cập nhật thông tin cá nhân bệnh nhân (hỗ trợ cả JSON và FormData)
export const updateProfile = async (updatedData) => {
  try {
    let payload = updatedData;
    let headers = {};

    // Nếu có trường avatar là File (hoặc bất kỳ file nào) → convert sang FormData
    if (updatedData.avatar instanceof File) {
      const formData = new FormData();
      Object.keys(updatedData).forEach((key) => {
        formData.append(key, updatedData[key]);
      });
      payload = formData;
      headers['Content-Type'] = 'multipart/form-data';
    }

    const res = await axiosInstance.put('/patients/me', payload, { headers });
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
