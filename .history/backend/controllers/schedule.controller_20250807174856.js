// controllers/schedule.controller.js
const Appointment = require('../models/Appointment');

exports.getDoctorAvailableSlots = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });
  }

  // Giờ hành chính chia 30 phút/lượt khám
  const workingSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30'
  ];

  try {
    // Xác định khoảng thời gian trong ngày
    const startOfDay = new Date(`${date}T00:00:00+07:00`);
    const endOfDay = new Date(`${date}T23:59:59+07:00`);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const bookedSlots = appointments.map(appt => {
      const time = new Date(appt.date).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      });
      return time;
    });

    const availableSlots = workingSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({ availableSlots });
  } catch (error) {
    console.error('Lỗi khi lấy khung giờ rảnh:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
