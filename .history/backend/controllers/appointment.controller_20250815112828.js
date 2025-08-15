// controllers/appointment.controller.js

const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail'); // Hàm gửi email OTP
const crypto = require('crypto');

/**
 * Đặt lịch khám
 */
exports.createAppointment = async (req, res) => {
  try {
    const {
      location,
      specialty,
      doctor,
      date,
      time,
      patient
    } = req.body;

    // Sinh OTP ngẫu nhiên (6 số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 5 phút ; có thể điều chỉnh thời gian

    // Tạo lịch hẹn
    const newAppointment = new Appointment({
      location,
      specialty,
      doctor,
      date,
      time,
      patient,
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending'
    });

    await newAppointment.save();

    // Gửi OTP qua email
    const subject = 'Xác nhận lịch khám - OTP';
    const message = `
      Xin chào ${patient.fullName},

      Bạn vừa đặt lịch khám vào ngày ${date} lúc ${time}.
      Mã OTP của bạn là: ${otp}
      (OTP có hiệu lực trong 5 phút)

      Xin vui lòng nhập mã OTP này để xác nhận lịch hẹn của bạn.
    `;

    await sendEmail(patient.email, subject, message);

    return res.status(201).json({
      message: 'Đặt lịch thành công. OTP đã được gửi qua email.',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Lỗi khi đặt lịch:', error);
    return res.status(500).json({ message: 'Đặt lịch thất bại', error: error.message });
  }
};

/**
 * Lấy lịch sử đặt lịch (lọc theo email bệnh nhân hoặc user login)
 */
exports.getAppointmentHistory = async (req, res) => {
  try {
    let query = {};

    // Nếu là user login -> lấy theo user ID hoặc email
    if (req.user && req.user.role === 'patient') {
      query = { 'patient.email': req.user.email };
    } else if (req.query.email) {
      // Nếu FE gửi email
      query = { 'patient.email': req.query.email };
    }

    const appointments = await Appointment.find(query)
      .populate('location')
      .populate('specialty')
      .populate('doctor')
      .sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử đặt lịch:', error);
    return res.status(500).json({ message: 'Không thể lấy lịch sử đặt lịch', error: error.message });
  }
};

/**
 * Xác thực OTP
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    if (appointment.isVerified) {
      return res.status(400).json({ message: 'Lịch hẹn đã được xác thực trước đó' });
    }

    if (appointment.otp !== otp) {
      return res.status(400).json({ message: 'OTP không chính xác' });
    }

    if (appointment.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }

    appointment.isVerified = true;
    appointment.status = 'confirmed';
    appointment.otp = null;
    appointment.otpExpiresAt = null;

    await appointment.save();

    return res.status(200).json({ message: 'Xác thực OTP thành công', appointment });
  } catch (error) {
    console.error('Lỗi khi xác thực OTP:', error);
    return res.status(500).json({ message: 'Xác thực OTP thất bại', error: error.message });
  }
};
