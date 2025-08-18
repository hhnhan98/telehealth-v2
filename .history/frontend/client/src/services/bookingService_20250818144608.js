import api from '../utils/axiosInstance'; // axios đã config baseURL + Bearer token

// Lấy danh sách cơ sở y tế
export const fetchLocations = async () => {
  const res = await api.get('/appointments/locations');
  return res.data;
};

// Lấy chuyên khoa theo cơ sở
export const fetchSpecialties = async (locationId, options = {}) => {
  const res = await api.get('/appointments/specialties', { params: { locationId }, ...options });
  return res.data;
};

// Lấy bác sĩ theo chuyên khoa + cơ sở
export const fetchDoctors = async (locationId, specialtyId, options = {}) => {
  const res = await api.get('/appointments/doctors', { params: { locationId, specialtyId }, ...options });
  return res.data;
};

// Lấy slot trống
export const fetchAvailableSlots = async (doctorId, date, options = {}) => {
  const res = await api.get('/appointments/available-slots', { params: { doctorId, date }, ...options });
  return res.data;
};

// Tạo lịch hẹn
export const createAppointment = async (data) => {
  const res = await api.post('/appointments', data);
  return res.data;
};

// Xác thực OTP
export const verifyOtp = async (appointmentId, otp) => {
  const res = await api.post('/appointments/verify-otp', { appointmentId, otp });
  return res.data;
};

// Gửi lại OTP
export const resendOtp = async (appointmentId) => {
  const res = await api.post('/appointments/resend-otp', { appointmentId });
  return res.data;
};
