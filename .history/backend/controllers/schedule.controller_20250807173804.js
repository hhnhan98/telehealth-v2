const Appointment = require('../models/Appointment');

exports.getDoctorAvailableSlots = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });
  }

  const workingSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30'
  ];

  try {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const bookedSlots = appointments.map((appt) => {
      const hour = new Date(appt.date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return hour;
    });

    const availableSlots = workingSlots.filter(slot => !bookedSlots.includes(slot));

    res.json(availableSlots);
  } catch (error) {
    console.error('Lỗi khi lấy khung giờ rảnh:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
