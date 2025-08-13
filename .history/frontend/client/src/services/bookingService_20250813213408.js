import axiosInstance from './axiosInstance';

export const getSpecialties = () => axiosInstance.get('/specialties');
export const getLocations = () => axiosInstance.get('/locations');
export const getDoctors = (specialtyId, locationId) =>
  axiosInstance.get('/doctors', { params: { specialtyId, locationId } });
export const getAvailableSlots = (doctorId, date) =>
  axiosInstance.get('/schedule/available', { params: { doctorId, date } });
export const createAppointment = (data) =>
  axiosInstance.post('/appointments', data);
