const Appointment = require('../models/appointment.model');

const createAppointment = async (req, res) => {
  try {
    const { specialty, doctor, date, time, note } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!specialty || !doctor || !date || !time) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc để đặt lịch hẹn',
      });
    }

    const newAppointment = new Appointment({
      patient: req.userId, // lấy từ middleware verifyToken
      specialty,
      doctor,
      date,
      time,
      note,
      status: 'pending', // mặc định
    });

    await newAppointment.save();

    res.status(201).json({
      message: 'Tạo lịch hẹn thành công',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Lỗi khi tạo lịch hẹn:', error);
    res.status(500).json({
      message: 'Không thể tạo lịch hẹn',
      error: error.message,
    });
  }
};

module.exports = { createAppointment };