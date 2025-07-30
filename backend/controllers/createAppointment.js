const Appointment = require('../models/appointment.model');

const createAppointment = async (req, res) => {
  try {
    const { specialty, doctor, date, time, note } = req.body;

    const newAppointment = new Appointment({
      patient: req.userId, // lấy từ middleware verifyToken
      specialty,
      doctor,
      date,
      time,
      note,
      status: 'pending', // mặc định
    });

    await newAppointment.save();

    res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
};

module.exports = { createAppointment };