const Appointment = require('../models/Appointment');

// Tạo mới lịch hẹn
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;

    // Kiểm tra đầu vào
    if (!doctor || !date || !time) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc: doctor, date hoặc time',
      });
    }

    // Ghép date + time thành đối tượng Date hoàn chỉnh
    const appointmentDateTime = new Date(`${date}T${time}:00`);

    const newAppointment = new Appointment({
      doctor,
      patient: req.userId, // từ middleware verifyToken
      date: appointmentDateTime,
      reason: reason || '',
      status: 'pending',
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

module.exports = {
  createAppointment,
};
