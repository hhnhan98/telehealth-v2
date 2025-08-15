const Appointment = require('../models/appointment.model');

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Chỉ cho phép hủy nếu trạng thái là 'confirmed'
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Chỉ có thể hủy lịch hẹn đã xác nhận' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      message: 'Đã hủy lịch hẹn thành công',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi hủy lịch hẹn',
      error: error.message,
    });
  }
};
