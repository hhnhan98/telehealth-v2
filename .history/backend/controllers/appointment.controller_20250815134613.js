// controllers/booking.controller.js

const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail');
const mongoose = require('mongoose');

// Sinh OTP ngẫu nhiên 6 chữ số
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ----------------------
// 1. Tạo lịch hẹn + gửi OTP
// ----------------------
const createAppointment = async (req, res) => {
  const { location, specialty, doctor, date, time, patient } = req.body;
  if (!location || !specialty || !doctor || !date || !time || !patient) {
    return res.status(400).json({ error: 'Thiếu thông tin' });
  }

  try {
    const exists = await Appointment.findOne({ doctor, date, time });
    if (exists) return res.status(400).json({ error: 'Giờ này đã được đặt' });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newAppt = new Appointment({
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

    await newAppt.save();

    // Gửi OTP qua email nếu có email
    const emailText = `
Xin chào ${patient.fullName},

Bạn vừa đặt lịch khám vào ngày ${date} lúc ${time}.
Mã OTP của bạn là: ${otp} (có hiệu lực 5 phút)

Vui lòng nhập mã OTP này để xác nhận lịch hẹn.
    `;
    try {
      if (patient.email) {
        await sendEmail(patient.email, 'OTP xác nhận lịch khám', emailText);
      } else {
        console.warn('Không tìm thấy email bệnh nhân cho appointment:', newAppt._id);
      }
    } catch (err) {
      console.error('Lỗi gửi email OTP:', err.message);
    }

    res.status(201).json({
      message: 'Đặt lịch thành công. OTP đã gửi (nếu có email).',
      appointment: newAppt
    });
  } catch (err) {
    console.error('Lỗi createAppointment:', err);
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

// ----------------------
// 2. Xác thực OTP
// ----------------------
const verifyOtp = async (req, res) => {
  const { appointmentId, otp } = req.body;

  if (!appointmentId || !otp) return res.status(400).json({ error: 'Thiếu dữ liệu' });
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) return res.status(400).json({ error: 'appointmentId không hợp lệ' });

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (!appointment.otp || !appointment.otpExpiresAt) {
      return res.status(400).json({ error: 'OTP chưa được gửi hoặc đã hết hạn' });
    }
    if (appointment.otp !== otp) return res.status(400).json({ error: 'OTP không đúng' });
    if (new Date() > appointment.otpExpiresAt) return res.status(400).json({ error: 'OTP đã hết hạn' });

    appointment.isVerified = true;
    appointment.otp = null;
    appointment.otpExpiresAt = null;
    appointment.status = 'confirmed';
    await appointment.save();

    res.json({ message: 'Xác thực OTP thành công. Lịch hẹn đã được xác nhận.' });
  } catch (err) {
    console.error('Lỗi verifyOtp:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = {
  createAppointment,
  verifyOtp
};
