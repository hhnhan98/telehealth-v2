// controllers/otp.controller.js
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail'); // Hàm gửi email sẽ viết ở bước sau
const crypto = require('crypto');

/**
 * Gửi OTP tới email bệnh nhân
 */
exports.sendOTP = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Tìm appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Tạo OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP + thời gian hết hạn vào DB (5 phút)
    appointment.otp = otp;
    appointment.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    await appointment.save();

    // Gửi email OTP
    const subject = 'Mã xác thực OTP cho lịch hẹn của bạn';
    const text = `Xin chào ${appointment.patient.fullName},\n\nMã OTP của bạn là: ${otp}\nMã này có hiệu lực trong 5 phút.\n\nTrân trọng,\nHệ thống Telehealth`;
    await sendEmail(appointment.patient.email, subject, text);

    res.json({ message: 'OTP đã được gửi tới email của bạn' });
  } catch (error) {
    console.error('Lỗi gửi OTP:', error);
    res.status(500).json({ message: 'Lỗi gửi OTP', error: error.message });
  }
};

/**
 * Xác thực OTP
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;

    // Tìm appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra OTP
    if (!appointment.otp || appointment.otp !== otp) {
      return res.status(400).json({ message: 'OTP không chính xác' });
    }

    // Kiểm tra thời gian hết hạn
    if (appointment.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }

    // Cập nhật trạng thái xác thực
    appointment.isVerified = true;
    appointment.status = 'confirmed';
    appointment.otp = undefined;
    appointment.otpExpiresAt = undefined;
    await appointment.save();

    res.json({ message: 'Xác thực OTP thành công', appointment });
  } catch (error) {
    console.error('Lỗi xác thực OTP:', error);
    res.status(500).json({ message: 'Lỗi xác thực OTP', error: error.message });
  }
};
