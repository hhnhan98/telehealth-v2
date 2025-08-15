const mongoose = require('mongoose');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// 1. Lấy danh sách cơ sở y tế
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().select('_id name address city').sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error('getLocations error:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// 2. Lấy chuyên khoa theo cơ sở
const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId) return res.status(400).json({ error: 'Thiếu locationId' });

    const doctors = await Doctor.find({ location: mongoose.Types.ObjectId(locationId) })
      .populate('specialty', '_id name');

    const specialties = [...new Map(doctors.map(doc => [doc.specialty._id.toString(), doc.specialty])).values()];

    res.json(specialties);
  } catch (err) {
    console.error('getSpecialtiesByLocation error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách chuyên khoa' });
  }
};

// 3. Lấy bác sĩ theo cơ sở + chuyên khoa
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { locationId, specialtyId } = req.query;
    if (!locationId || !specialtyId) return res.status(400).json({ error: 'Thiếu locationId hoặc specialtyId' });

    const doctors = await Doctor.find({
      location: mongoose.Types.ObjectId(locationId),
      specialty: mongoose.Types.ObjectId(specialtyId)
    }).select('_id fullName profileImage degree experience');

    res.json(doctors);
  } catch (err) {
    console.error('getDoctorsBySpecialtyAndLocation error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ' });
  }
};

// 4. Lấy khung giờ trống của bác sĩ
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });

    const workHours = [
      '08:00','08:30','09:00','09:30','10:00','10:30',
      '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
    ];

    const startOfDay = new Date(date);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23,59,59,999);

    const bookedAppointments = await Appointment.find({
      doctor: mongoose.Types.ObjectId(doctorId),
      time: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).select('time');

    // Chuyển bookedAppointments về format 'HH:mm'
    const bookedTimes = bookedAppointments.map(a => {
      const t = new Date(a.time);
      return t.getHours().toString().padStart(2,'0') + ':' + t.getMinutes().toString().padStart(2,'0');
    });

    const availableSlots = workHours.filter(slot => !bookedTimes.includes(slot));

    res.json(availableSlots);
  } catch (err) {
    console.error('getAvailableSlots error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống' });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots
};
