const Appointment = require('../models/Appointment');

// Tạo mới lịch hẹn
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (doctorId, date, time)' });
    }

    // Kiểm tra bác sĩ tồn tại
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Không tìm thấy bác sĩ' });
    }

    // Tách ngày tháng năm
    const [day, month, year] = date.split('/');
    const [hour, minute] = time.split(':');

    if (!day || !month || !year || !hour || !minute) {
      return res.status(400).json({ error: 'Định dạng ngày hoặc giờ không hợp lệ' });
    }

    // Tạo object Date
    const appointmentDate = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10));

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: 'Ngày giờ không hợp lệ' });
    }

    // Tạo lịch hẹn
    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.user.id, // từ token
      date: appointmentDate,
      reason: reason || '',
      status: 'pending',
    });

    await newAppointment.save();

    res.status(201).json({
      message: 'Đặt lịch thành công',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Lỗi createAppointment:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo cuộc hẹn' });
  }
};

module.exports = {
  createAppointment,
};
