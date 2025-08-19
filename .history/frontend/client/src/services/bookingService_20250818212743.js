// import axiosInstance from './api';

// const BASE_URL = '/appointments';

// // ------------------------- Dropdown APIs -------------------------

// // Lấy danh sách cơ sở y tế
// export const fetchLocations = async () => {
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/locations`);
//     console.log('fetchLocations response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchLocations error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Lấy danh sách chuyên khoa theo cơ sở
// export const fetchSpecialties = async (locationId) => {
//   if (!locationId) return { specialties: [] };
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/specialties?locationId=${locationId}`);
//     console.log('fetchSpecialties response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchSpecialties error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Lấy danh sách bác sĩ theo cơ sở + chuyên khoa
// export const fetchDoctors = async (locationId, specialtyId) => {
//   if (!locationId || !specialtyId) return { doctors: [] };
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/doctors?locationId=${locationId}&specialtyId=${specialtyId}`);
//     console.log('fetchDoctors response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchDoctors error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Lấy khung giờ trống
// export const fetchAvailableSlots = async (doctorId, date) => {
//   if (!doctorId || !date) return { availableSlots: [] };
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}/available-slots?doctorId=${doctorId}&date=${date}`);
//     console.log('fetchAvailableSlots response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchAvailableSlots error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // ------------------------- Create Appointment -------------------------

// // Tạo lịch hẹn mới (chỉ user đã login)
// export const createAppointment = async (appointmentData) => {
//   if (!appointmentData) throw new Error('Thiếu dữ liệu đặt lịch');

//   try {
//     console.log('--- CREATE APPOINTMENT PAYLOAD TO BE SENT ---');
//     console.log(appointmentData);

//     const response = await axiosInstance.post(`${BASE_URL}`, appointmentData);
    
//     console.log('--- RESPONSE FROM BACKEND ---');
//     console.log(response.data);

//     return response.data;
//   } catch (error) {
//     console.error('--- CREATE APPOINTMENT ERROR (FE) ---');
//     if (error.response) {
//       console.error('Status:', error.response.status);
//       console.error('Data:', error.response.data);
//     } else {
//       console.error(error.message);
//     }
//     throw error;
//   }
// };

// // ------------------------- OTP APIs -------------------------

// // Xác thực OTP
// export const verifyOtp = async (appointmentId, otp) => {
//   if (!appointmentId || !otp) throw new Error('Thiếu thông tin OTP');
//   try {
//     const res = await axiosInstance.post(`${BASE_URL}/verify-otp`, { appointmentId, otp });
//     console.log('verifyOtp response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('verifyOtp error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // Gửi lại OTP
// export const resendOtp = async (appointmentId) => {
//   if (!appointmentId) throw new Error('Thiếu appointment ID');
//   try {
//     const res = await axiosInstance.post(`${BASE_URL}/resend-otp`, { appointmentId });
//     console.log('resendOtp response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('resendOtp error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // ------------------------- Cancel Appointment -------------------------

// export const cancelAppointment = async (id) => {
//   if (!id) throw new Error('Thiếu appointment ID');
//   try {
//     const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
//     console.log('cancelAppointment response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('cancelAppointment error:', err.response?.data || err.message);
//     throw err;
//   }
// };

// // ------------------------- Fetch Appointments -------------------------

// // Lấy danh sách lịch hẹn của user hiện tại
// export const fetchAppointments = async () => {
//   try {
//     const res = await axiosInstance.get(`${BASE_URL}`);
//     console.log('fetchAppointments response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('fetchAppointments error:', err.response?.data || err.message);
//     throw err;
//   }
// };
