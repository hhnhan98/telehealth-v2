// services/otpService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/otp';

// Gửi OTP qua email
export const sendOTP = async (email) => {
  const res = await axios.post(`${API_URL}/send-otp`, { email });
  return res.data;
};

// Xác minh OTP
export const verifyOTP = async (email, otp) => {  
  const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
  return res.data;
};
