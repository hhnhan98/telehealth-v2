const Appointment = require('../../models/Appointment');
const { sendEmail } = require('../../utils/sendEmail');

// Helper: sinh OTP 6 chữ số
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: chuẩn hóa response
const responseSuccess = (res, message, data = {}) => res.status(200).json({ success: true, message, data });
const responseError = (res, message, status = 400) => res.status(status).json({ success: false, message });

// ----------------------
// 1. Gửi OTP cho lịch hẹn
// ----------------------
const sendOtpForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return responseError(res, 'Thiếu appointmentId');

    const appointment = await Appointment.findById(appointmentId).populate('patient');
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    appointment.otp = otp;
    appointment.otpExpiresAt = expiresAt;
    await appointment.save();

    const emailText = `Mã OTP xác nhận lịch khám của bạn là: ${otp}. Hết hạn sau 5 phút.`;
    await sendEmail(appointment.patient.email, 'OTP xác nhận lịch khám', emailText);

    return responseSuccess(res, 'OTP đã được gửi đến email của bạn.', { otpSent: true });
  } catch (err) {
    console.error('Lỗi sendOtpForAppointment:', err);
    return responseError(res, 'Lỗi server', 500);
  }
};

// 2. Xác thực OTP
// ----------------------
const verifyAppointmentOtp = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;
    if (!appointmentId || !otp) return responseError(res, 'Thiếu dữ liệu');

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);

    if (!appointment.otp || !appointment.otpExpiresAt) {
      return responseError(res, 'OTP chưa được gửi hoặc đã hết hạn');
    }

    if (appointment.otp !== otp) return responseError(res, 'OTP không đúng');
    if (new Date() > appointment.otpExpiresAt) return responseError(res, 'OTP đã hết hạn');

    appointment.isVerified = true;
    appointment.otp = null;
    appointment.otpExpiresAt = null;
    appointment.status = 'confirmed';
    await appointment.save();

    return responseSuccess(res, 'Xác thực OTP thành công. Lịch hẹn đã được xác nhận.');
  } catch (err) {
    console.error('Lỗi verifyAppointmentOtp:', err);
    return responseError(res, 'Lỗi server', 500);
  }
};

module.exports = {
  sendOtpForAppointment,
  verifyAppointmentOtp,
};

// const Appointment = require('../../models/Appointment');
// const sendEmail = require('../../utils/sendEmail');

// // Sinh OTP ngẫu nhiên 6 chữ số
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // ----------------------
// // 1. Gửi OTP cho lịch hẹn vừa tạo
// // ----------------------
// const sendOtpForAppointment = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     if (!appointmentId) return res.status(400).json({ error: 'Thiếu appointmentId' });

//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

//     const otp = generateOTP();
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

//     appointment.otp = otp;
//     appointment.otpExpiresAt = expiresAt;
//     await appointment.save();

//     const emailText = `Mã OTP xác nhận lịch khám của bạn là: ${otp}. Hết hạn sau 5 phút.`;
//     await sendEmail(appointment.patient.email, 'OTP xác nhận lịch khám', emailText);

//     res.json({ message: 'OTP đã được gửi đến email của bạn.' });
//   } catch (err) {
//     console.error('Lỗi sendOtpForAppointment:', err);
//     res.status(500).json({ error: 'Lỗi server', details: err.message });
//   }
// };

// // ----------------------
// // 2. Xác thực OTP
// // ----------------------
// const verifyAppointmentOtp = async (req, res) => {
//   try {
//     const { appointmentId, otp } = req.body;
//     if (!appointmentId || !otp) return res.status(400).json({ error: 'Thiếu dữ liệu' });

//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

//     if (!appointment.otp || !appointment.otpExpiresAt) {
//       return res.status(400).json({ error: 'OTP chưa được gửi hoặc đã hết hạn' });
//     }

//     if (appointment.otp !== otp) return res.status(400).json({ error: 'OTP không đúng' });
//     if (new Date() > appointment.otpExpiresAt) return res.status(400).json({ error: 'OTP đã hết hạn' });

//     appointment.isVerified = true;
//     appointment.otp = null;
//     appointment.otpExpiresAt = null;
//     appointment.status = 'confirmed';
//     await appointment.save();

//     res.json({ message: 'Xác thực OTP thành công. Lịch hẹn đã được xác nhận.' });
//   } catch (err) {
//     console.error('Lỗi verifyAppointmentOtp:', err);
//     res.status(500).json({ error: 'Lỗi server', details: err.message });
//   }
// };

// module.exports = {
//   sendOtpForAppointment,
//   verifyAppointmentOtp,
// };
