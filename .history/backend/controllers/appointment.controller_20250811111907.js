const Appointment = require('../models/Appointment');

// Tạo mới lịch hẹn
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc: doctorId, date hoặc time',
      });
    }

    // Chuyển dd/mm/yyyy thành yyyy-mm-dd
    const [day, month, year] = date.split('/');
    if (!day || !month || !year) {
      return res.status(400).json({ message: 'Ngày không hợp lệ (dd/mm/yyyy)' });
    }
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Ghép isoDate với time
    const datetimeString = `${isoDate}T${time}:00`;
    const appointmentDate = new Date(datetimeString);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Ngày giờ không hợp lệ' });
    }

    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.user.id,
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
