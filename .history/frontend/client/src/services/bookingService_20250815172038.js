// src/services/bookingService.js
import axios from '../utils/axiosInstance';

// ----------------------
// 1. Lấy danh sách cơ sở y tế
// ----------------------
export const fetchLocations = async () => {
  const res = await axios.get('/appointments/locations');
  return res.data;
};

// ----------------------
// 2. Lấy danh sách chuyên khoa theo location
// ----------------------
export const fetchSpecialties = async (locationId) => {
  if (!locationId) throw new Error('Thiếu locationId');
  const res = await axios.get(`/appointments/specialties?locationId=${locationId}`);
  return res.data;
};

// ----------------------
// 3. Lấy danh sách bác sĩ theo location + specialty
// ----------------------
export const fetchDoctors = async (locationId, specialtyId) => {
  if (!locationId || !specialtyId) throw new Error('Thiếu params locationId hoặc specialtyId');
  const res = await axios.get(`/appointments/doctors?locationId=${locationId}&specialtyId=${specialtyId}`);
  return res.data;
};

// ----------------------
// 4. Lấy khung giờ khám trống
// ----------------------
export const fetchAvailableSlots = async (doctorId, date) => {
  if (!doctorId || !date) throw new Error('Thiếu params doctorId hoặc date');
  const res = await axios.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
  return res.data;
};

// ----------------------
// 5. Tạo lịch khám + gửi OTP email
// ----------------------
export const createAppointment = async (appointmentData) => {
  // Ghi chú: backend route là POST /api/appointments/
  const res = await axios.post('/appointments/', appointmentData);
  return res.data;
};

// ----------------------
// 6. Xác thực OTP
// ----------------------
export const verifyOtp = async (appointmentId, otp) => {
  if (!appointmentId || !otp) throw new Error('Thiếu params appointmentId hoặc otp');
  const res = await axios.post('/appointments/verify-otp', { appointmentId, otp });
  return res.data;
};
