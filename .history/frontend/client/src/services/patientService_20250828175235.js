// src/services/patientService.js
import axiosInstance from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

// Lấy profile của bệnh nhân đang đăng nhập
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

// ====== Phần Admin : đang phát triển =====
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

// Lấy danh sách bệnh nhân do bác sĩ phụ trách
export const getPatientsByDoctor = async () => {
  try {
    const res = await axiosInstance.get('/doctors/my-patients'); 
    // res.data = { success, message, data }
    if (res.data.success) {
      return { success: true, data: res.data.data || [] };
    } else {
      return { success: false, data: [], message: res.data.message };
    }
  } catch (err) {
    console.error('getPatientsByDoctor error:', err);
    return { success: false, data: [], message: 'Lỗi khi lấy danh sách bệnh nhân' };
  }
};


// Lấy danh sách phiếu khám của 1 bệnh nhân
export const getMedicalRecordsByPatient = async (patientId) => {
  try {
    const res = await axiosInstance.get(`/medical-records/patient/${patientId}`);
    if (res.data.success) {
      return { success: true, data: res.data.data || [] };
    } else {
      return { success: false, data: [], message: res.data.message };
    }
  } catch (err) {
    console.error('getMedicalRecordsByPatient error:', err);
    return { success: false, data: [], message: 'Lỗi khi lấy phiếu khám bệnh' };
  }
};

// Lấy danh sách hồ sơ bệnh án của bệnh nhân đang đăng nhập
export const getMyMedicalRecords = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const res = await axiosInstance.get('/patients/me/medical-records', { 
      params: { page, limit } 
    });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getMyMedicalRecords');
  }
};
// Lấy danh sách hồ sơ bệnh án của bệnh nhân đang đăng nhập
export const getMyMedicalRecords = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const res = await axiosInstance.get('/patients/me/medical-records', { 
      params: { page, limit } 
    });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'getMyMedicalRecords');
  }
};


const patientService = {
  getMyProfile,
  updateProfile,
  getPatients,
  getPatientById,
  deletePatient,
  getMedicalRecordsByPatient,
  getPatientsByDoctor,
  getMyMedicalRecords,
};

export default patientService;
