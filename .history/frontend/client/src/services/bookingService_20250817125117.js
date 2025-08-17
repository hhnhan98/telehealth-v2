import axiosInstance from './api';

const BASE_URL = '/appointments';

// Lấy danh sách cơ sở y tế
export const fetchLocations = async () => {
  const res = await axiosInstance.get(`${BASE_URL}/locations`);
  return res.data;
};

// Lấy danh sách chuyên khoa theo cơ sở
export const fetchSpecialties = async (locationId) => {
  if (!locationId) return { specialties: [] };
  const res = await axiosInstance.get(`${BASE_URL}/specialties?locationId=${locationId}`);
  return res.data;
};

// Lấy danh sách bác sĩ theo cơ sở + chuyên khoa
export const fetchDoctors = async (locationId, specialtyId) => {
  if (!locationId || !specialtyId) return { doctors: [] };
  const res = await axiosInstance.get(`${BASE_URL}/doctors?locationId=${locationId}&specialtyId=${specialtyId}`);
  return res.data;
};

// Lấy khung giờ trống
export const fetchAvailableSlots = async (doctorId, date) => {
  if (!doctorId || !date) return { availableSlots: [] };
  const res = await axiosInstance.get(`${BASE_URL}/available-slots?doctorId=${doctorId}&date=${date}`);
  return res.data;
};

// Tạo lịch hẹn mới
export const createAppointment = async (payload) => {
  const res = await axiosInstance.post(`${BASE_URL}`, payload);
  return res.data;
};

// Xác thực OTP
export const verifyOtp = async (appointmentId, otp) => {
  if (!appointmentId || !otp) throw new Error('Thiếu thông tin OTP');
  const res = await axiosInstance.post(`${BASE_URL}/verify-otp`, { appointmentId, otp });
  return res.data;
};

// Gửi lại OTP
export const resendOtp = async (appointmentId) => {
  const res = await axiosInstance.post(`${BASE_URL}/resend-otp`, { appointmentId });
  return res.data;
};

// Hủy lịch hẹn
export const cancelAppointment = async (id) => {
  if (!id) throw new Error('Thiếu appointment ID');
  const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return res.data;
};

// Lấy danh sách lịch hẹn của user hiện tại
export const fetchAppointments = async () => {
  const res = await axiosInstance.get(`${BASE_URL}`);
  return res.data;
};
