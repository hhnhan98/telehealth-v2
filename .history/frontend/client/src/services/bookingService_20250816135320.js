// src/services/bookingService.js
import axios from 'axios';

const BASE_URL = '/api/appointments';

// Helper lấy headers JWT động
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lấy danh sách cơ sở y tế
export const fetchLocations = async () => {
  const res = await axios.get(`${BASE_URL}/locations`, { headers: getHeaders() });
  return res.data; // { locations: [...] }
};

// Lấy danh sách chuyên khoa theo cơ sở
export const fetchSpecialties = async (locationId) => {
  if (!locationId) return { specialties: [] };
  const res = await axios.get(`${BASE_URL}/specialties?locationId=${locationId}`, { headers: getHeaders() });
  return res.data; // { specialties: [...] }
};

// Lấy danh sách bác sĩ theo cơ sở + chuyên khoa
export const fetchDoctors = async (locationId, specialtyId) => {
  if (!locationId || !specialtyId) return { doctors: [] };
  const res = await axios.get(`${BASE_URL}/doctors?locationId=${locationId}&specialtyId=${specialtyId}`, { headers: getHeaders() });
  return res.data; // { doctors: [...] }
};

// Lấy khung giờ trống
export const fetchAvailableSlots = async (doctorId, date) => {
  if (!doctorId || !date) return { availableSlots: [] };
  const res = await axios.get(`${BASE_URL}/available-slots?doctorId=${doctorId}&date=${date}`, { headers: getHeaders() });
  return res.data; // { availableSlots: [...] }
};

// Tạo lịch hẹn mới
export const createAppointment = async (payload) => {
  const res = await axios.post(`${BASE_URL}`, payload, { headers: getHeaders() });
  return res.data; // { message, appointment }
};

// Xác thực OTP
export const verifyOtp = async (appointmentId, otp) => {
  if (!appointmentId || !otp) throw new Error('Thiếu thông tin OTP');
  const res = await axios.post(`${BASE_URL}/verify-otp`, { appointmentId, otp }, { headers: getHeaders() });
  return res.data; // { message, appointment }
};

// Hủy lịch hẹn
export const cancelAppointment = async (id) => {
  if (!id) throw new Error('Thiếu appointment ID');
  const res = await axios.delete(`${BASE_URL}/${id}`, { headers: getHeaders() });
  return res.data; // { message, appointment }
};

// Lấy danh sách lịch hẹn của user hiện tại
export const fetchAppointments = async () => {
  const res = await axios.get(`${BASE_URL}`, { headers: getHeaders() });
  return res.data; // { appointments: [...] }
};
