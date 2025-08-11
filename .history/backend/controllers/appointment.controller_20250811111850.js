const Appointment = require('../models/Appointment');

// Tạo mới lịch hẹn
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, reason } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc: doctorId hoặc date',
      });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Ngày giờ không hợp lệ' });
    }

    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.user.id, // Lấy từ middleware verifyToken
      date: appointmentDate,
      reason: reason || '',
      status: 'pending',
    });

    await newAppointment.save();

    return res.status(201).json({
      message: 'Tạo lịch hẹn thành công',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Lỗi khi tạo lịch hẹn:', error);
    return res.status(500).json({
      message: 'Không thể tạo lịch hẹn',
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
};
