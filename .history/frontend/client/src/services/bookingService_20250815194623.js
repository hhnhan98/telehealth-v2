import axios from '../utils/axiosInstance';

// 1. Lấy danh sách cơ sở y tế
export const fetchLocations = async () => {
  try {
    const res = await axios.get('/appointments/locations');
    return res.data;
  } catch (err) {
    console.error('Fetch locations error:', err.response || err);
    throw err;
  }
};

// 2. Lấy danh sách chuyên khoa theo location
export const fetchSpecialties = async (locationId) => {
  if (!locationId) throw new Error('Thiếu locationId');
  try {
    const res = await axios.get(`/appointments/specialties?locationId=${locationId}`);
    return res.data;
  } catch (err) {
    console.error('Fetch specialties error:', err.response || err);
    throw err;
  }
};

// 3. Lấy danh sách bác sĩ theo location + specialty
export const fetchDoctors = async (locationId, specialtyId) => {
  if (!locationId || !specialtyId) throw new Error('Thiếu params locationId hoặc specialtyId');
  try {
    const res = await axios.get(`/appointments/doctors?locationId=${locationId}&specialtyId=${specialtyId}`);
    return res.data;
  } catch (err) {
    console.error('Fetch doctors error:', err.response || err);
    throw err;
  }
};

// ----------------------
// 4. Lấy khung giờ khám trống
// ----------------------
export const fetchAvailableSlots = async (doctorId, date) => {
  if (!doctorId || !date) throw new Error('Thiếu params doctorId hoặc date');
  try {
    const res = await axios.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
    return res.data;
  } catch (err) {
    console.error('Fetch available slots error:', err.response || err);
    throw err;
  }
};

// ----------------------
// 5. Tạo lịch khám + gửi OTP email
// ----------------------
export const createAppointment = async (appointmentData) => {
  if (!appointmentData) throw new Error('Thiếu dữ liệu đặt lịch');

  try {
    const res = await axios.post('/appointments', appointmentData);
    return res.data;
  } catch (err) {
    console.error('Create appointment error:', err.response || err);
    throw err;
  }
};

// ----------------------
// 6. Xác thực OTP
// ----------------------
export const verifyOtp = async (appointmentId, otp) => {
  if (!appointmentId || !otp) throw new Error('Thiếu params appointmentId hoặc otp');

  try {
    const res = await axios.post('/appointments/verify-otp', { appointmentId, otp });
    return res.data;
  } catch (err) {
    console.error('Verify OTP error:', err.response || err);
    throw err;
  }
};
