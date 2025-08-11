const Appointment = require('../models/Appointment');

// Tạo mới lịch hẹn
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (doctorId, date, time)' });
    }

    // Kiểm tra bác sĩ tồn tại
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Không tìm thấy bác sĩ' });
    }

    // Chuyển date + time thành object Date chuẩn
    // date: dd/mm/yyyy, time: HH:mm
    const [day, month, year] = date.split('/');
    const [hour, minute] = time.split(':');
    const appointmentDate = new Date(year, month - 1, day, hour, minute);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: 'Ngày giờ không hợp lệ' });
    }

    // Tạo cuộc hẹn
    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.user.id, // lấy từ token
      date: appointmentDate,
      reason: reason || '',
      status: 'pending',
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Đặt lịch thành công', appointment: newAppointment });
  } catch (error) {
    console.error('Lỗi createAppointment:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo cuộc hẹn' });
  }
};


module.exports = {
  createAppointment,
};
