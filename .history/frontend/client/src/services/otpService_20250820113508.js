import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const verifyOtp = async (appointmentId, otp) => {
  try {
    const res = await api.post('/appointments/verify-otp', { appointmentId, otp });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'verifyOtp');
  }
};

const resendOtp = async (appointmentId) => {
  try {
    const res = await api.post('/appointments/resend-otp', { appointmentId });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'resendOtp');
  }
};

const otpService = { verifyOtp, resendOtp };
export default otpService;
