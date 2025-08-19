import axiosInstance from './api';

// ------------------------- Helper -------------------------
const handleError = (err, context = 'OtpService') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  throw err.response?.data || err;
};

// ------------------------- OTP APIs -------------------------

// Gửi OTP tới email

export const sendOTP = async (email) => {
  if (!email) throw new Error('Thiếu email để gửi OTP');
  try {
    const res = await axiosInstance.post('/otp/send-otp', { email });
    return res.data || { success: false, message: 'Không có dữ liệu trả về' };
  } catch (err) {
    return handleError(err, 'sendOTP');
  }
};

// Xác thực OTP
export const verifyOTP = async (email, otp) => {
  if (!email || !otp) throw new Error('Thiếu email hoặc OTP để xác thực');
  try {
    const res = await axiosInstance.post('/otp/verify-otp', { email, otp });
    return res.data || { success: false, message: 'Không có dữ liệu trả về' };
  } catch (err) {
    return handleError(err, 'verifyOTP');
  }
};

// ------------------------- Export -------------------------
const otpService = {
  sendOTP,
  verifyOTP,
};

export default otpService;
