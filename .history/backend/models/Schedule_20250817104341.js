const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const sendEmail = require('../utils/sendEmail');

// ----------------------
// Controller: Hủy lịch hẹn
// ----------------------
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy lịch hẹn + populate thông tin bệnh nhân để gửi email
    const appointment = await Appointment.findById(id).populate('patient', 'email fullName');
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Chỉ cho phép hủy nếu trạng thái là 'confirmed' hoặc 'pending'
    if (!['confirmed', 'pending'].includes(appointment.status)) {
      return res.status(400).json({
        message: 'Chỉ có thể hủy lịch hẹn đang chờ xác nhận hoặc đã xác nhận',
      });
    }

    // Cập nhật trạng thái lịch hẹn
    appointment.status = 'cancelled';
    await appointment.save();

    // Đồng bộ với Schedule (giải phóng slot nếu có workScheduleId)
    if (appointment.workScheduleId) {
      const schedule = await Schedule.findById(appointment.workScheduleId);
      if (schedule && schedule.date === appointment.date) {
        const slot = schedule.slots.find(s => s.time === appointment.time);
        if (slot) slot.isBooked = false;
        await schedule.save();
      }
    }

    // Gửi email thông báo hủy
    if (appointment.patient?.email) {
      await sendEmail({
        to: appointment.patient.email,
        subject: 'Thông báo hủy lịch hẹn',
        text: `Xin chào ${appointment.patient.fullName || ''},\n\n` +
              `Lịch hẹn ngày ${appointment.date} lúc ${appointment.time} đã bị hủy.\n\n` +
              `Trân trọng,\nTelehealth System`
      });
    }

    res.json({
      message: 'Đã hủy lịch hẹn thành công',
      appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi hủy lịch hẹn',
      error: error.message,
    });
  }
};
