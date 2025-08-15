const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// GET /booking/locations
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load locations' });
  }
};

// GET /booking/specialties?locationId=...
const getSpecialtiesByLocation = async (req, res) => {
  const { locationId } = req.query;
  if (!locationId) return res.status(400).json({ error: 'Thiếu locationId' });

  try {
    const specialties = await Specialty.find({ location: locationId });
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load specialties' });
  }
};

// GET /booking/doctors?locationId=...&specialtyId=...
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  const { locationId, specialtyId } = req.query;
  if (!locationId || !specialtyId) return res.status(400).json({ error: 'Thiếu params' });

  try {
    const doctors = await Doctor.find({
      location: locationId,
      specialties: specialtyId
    });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load doctors' });
  }
};

// GET /booking/available-slots?doctorId=...&date=YYYY-MM-DD
const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ error: 'Thiếu params' });

  try {
    const booked = await Appointment.find({ doctor: doctorId, date }).select('time -_id');
    const bookedTimes = booked.map(a => a.time);

    // Giả sử giờ khám cố định 8:00 → 16:30, 30 phút/lượt
    const allTimes = [];
    for (let h = 8; h < 17; h++) {
      ['00','30'].forEach(m => allTimes.push(`${h.toString().padStart(2,'0')}:${m}`));
    }

    const availableTimes = allTimes.filter(t => !bookedTimes.includes(t));
    res.json(availableTimes);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load giờ khám' });
  }
};

// POST /booking/create
const createAppointment = async (req, res) => {
  const { location, specialty, doctor, date, time, patient } = req.body;
  if (!location || !specialty || !doctor || !date || !time || !patient) {
    return res.status(400).json({ error: 'Thiếu thông tin' });
  }

  try {
    // Kiểm tra giờ đã đặt chưa
    const exists = await Appointment.findOne({ doctor, date, time });
    if (exists) return res.status(400).json({ error: 'Giờ này đã được đặt' });

    const newAppt = new Appointment({ location, specialty, doctor, date, time, patient });
    await newAppt.save();
    res.json({ message: 'Đặt lịch thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn' });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment
};
