// src/services/appointmentService.js
import axiosInstance from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

export const createMedicalReceipt = async (appointmentId, data) => {
  try {
    const res = await axiosInstance.post(`/doctors/appointments/${appointmentId}/medical-receipt`, data);
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'createMedicalReceipt');
  }
};
