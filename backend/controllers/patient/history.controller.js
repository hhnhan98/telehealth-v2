// controllers/appointment/history.controller.js

const Appointment = require('../../models/Appointment');

const getUserAppointments = async (req, res) => {
  const userId = req.user._id; // từ auth middleware
  try {
    const appointments = await Appointment.find({ 'patient._id': userId })
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load lịch hẹn', details: err.message });
  }
};

module.exports = { getUserAppointments };
