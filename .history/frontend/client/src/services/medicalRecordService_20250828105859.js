// src/services/medicalRecordService.js
import axiosInstance from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

// ------------------------- MedicalRecord APIs -------------------------

// Lấy danh sách hồ sơ bệnh án (doctor/admin)
export const getMedicalRecords = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/medical-records', { params });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getMedicalRecords');
  }
};

// Lấy chi tiết hồ sơ bệnh án theo ID
export const getMedicalRecordById = async (id) => {
  try {
    const res = await axiosInstance.get(`/medical-records/${id}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getMedicalRecordById');
  }
};

// Lấy danh sách hồ sơ bệnh án của 1 bệnh nhân
export const getMedicalRecordsByPatient = async (patientId, params = {}) => {
  try {
    const res = await axiosInstance.get(`/medical-records/patient/${patientId}`, { params });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getMedicalRecordsByPatient');
  }
};

// Tạo hồ sơ bệnh án mới (chỉ doctor)
export const createMedicalRecord = async (data) => {
  try {
    const res = await axiosInstance.post('/medical-records', data);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'createMedicalRecord');
  }
};

// Cập nhật hồ sơ bệnh án (chỉ doctor)
export const updateMedicalRecord = async (id, data) => {
  try {
    const res = await axiosInstance.patch(`/medical-records/${id}`, data);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'updateMedicalRecord');
  }
};

// Xóa hồ sơ bệnh án (doctor/admin)
export const deleteMedicalRecord = async (id) => {
  try {
    const res = await axiosInstance.delete(`/medical-records/${id}`);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'deleteMedicalRecord');
  }
};

const medicalRecordService = {
  getMedicalRecords,
  getMedicalRecordById,
  getMedicalRecordsByPatient,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
};

export default medicalRecordService;
