// controllers/appointment/history.controller.js
const Appointment = require('../../models/Appointment');

const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    const appointments = await Appointment.find({ patient: userId })
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .sort({ datetime: 1 });

    res.json({ appointments });
  } catch (err) {
    console.error('Lỗi load lịch hẹn:', err);
    res.status(500).json({ error: 'Lỗi load lịch hẹn', details: err.message });
  }
};

module.exports = { getUserAppointments };
