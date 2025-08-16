// src/services/bookingService.js
import axios from 'axios';

const token = localStorage.getItem('token');

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
// Lấy danh sách cơ sở y tế
export const fetchLocations = async () => {
  const res = await axios.get('/api/appointments/locations', { headers });
  return res.data; // { locations: [...] }
};

// Lấy danh sách chuyên khoa theo location
export const fetchSpecialties = async (locationId) => {
  const res = await axios.get(`/api/appointments/specialties?locationId=${locationId}`, { headers });
  return res.data; // { specialties: [...] }
};

// Lấy danh sách bác sĩ theo location + specialty
export const fetchDoctors = async (locationId, specialtyId) => {
  const res = await axios.get(`/api/appointments/doctors?locationId=${locationId}&specialtyId=${specialtyId}`, { headers });
  return res.data; // { doctors: [...] }
};

// Lấy khung giờ trống
export const fetchAvailableSlots = async (doctorId, date) => {
  const res = await axios.get(`/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`, { headers });
  return res.data; // { availableSlots: [...] }
};

// Tạo lịch hẹn
export const createAppointment = async (payload) => {
  const res = await axios.post('/api/appointments', payload, { headers });
  return res.data; // { message, appointment }
};

// Xác thực OTP
export const verifyOtp = async (appointmentId, otp) => {
  const res = await axios.post('/api/appointments/verify-otp', { appointmentId, otp }, { headers });
  return res.data;
};

// Hủy lịch hẹn
export const cancelAppointment = async (id) => {
  const res = await axios.delete(`/api/appointments/${id}`, { headers });
  return res.data;
};

// Lấy danh sách lịch hẹn user
export const fetchAppointments = async () => {
  const res = await axios.get('/api/appointments', { headers });
  return res.data; // { appointments: [...] }
};
