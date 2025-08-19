import axiosInstance from '../utils/axiosInstance';

export const getAvailableSlots = (doctorId, date) =>
  axiosInstance.get(`/schedule/available/${doctorId}?date=${date}`);

export const getWorkSchedule = (date, view = 'day') =>
  axiosInstance.get(`/schedule/work-schedule?date=${date}&view=${view}`);

export const createWorkSchedule = (date, slots) =>
  axiosInstance.post('/schedule/create', { date, slots });

export const updateWorkSchedule = (date, slots) =>
  axiosInstance.put('/schedule/update', { date, slots });

export const deleteWorkSchedule = (date) =>
  axiosInstance.delete('/schedule/delete', { data: { date } });
