const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// 1. Lấy danh sách địa điểm
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().select('_id name address city');
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách địa điểm' });
  }
};

// 2. Lấy chuyên khoa theo địa điểm
const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId))
      return res.status(400).json({ error: 'Thiếu hoặc sai locationId' });

    const doctors = await Doctor.find({ location: locationId }).populate('specialty', '_id name');
    const specialties = [...new Map(doctors.map(d => [d.specialty._id, d.specialty])).values()];

    res.json(specialties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy chuyên khoa' });
  }
};

// 3. Lấy bác sĩ theo chuyên khoa + địa điểm
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { locationId, specialtyId } = req.query;
    if (!locationId || !specialtyId)
      return res.status(400).json({ error: 'Thiếu locationId hoặc specialtyId' });
    if (!mongoose.Types.ObjectId.isValid(locationId) || !mongoose.Types.ObjectId.isValid(specialtyId))
      return res.status(400).json({ error: 'ID không hợp lệ' });

    const doctors = await Doctor.find({ location: locationId, specialty: specialtyId })
      .select('_id fullName profileImage degree experience');

    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ' });
  }
};

// 4. Lấy khung giờ trống của bác sĩ
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date)
      return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ error: 'doctorId không hợp lệ' });

    const workHours = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      time: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    }).select('time');

    const bookedTimes = appointments.map(a => {
      const h = a.time.getHours().toString().padStart(2, '0');
      const m = a.time.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    });

    const available = workHours.filter(slot => !bookedTimes.includes(slot));

    res.json(available);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống' });
  }
};

// 5. Tạo lịch khám
const createAppointment = async (req, res) => {
  try {
    const { locationId, specialtyId, doctorId, date, time, patient } = req.body;
    if (!locationId || !specialtyId || !doctorId || !date || !time || !patient)
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });

    if (!mongoose.Types.ObjectId.isValid(locationId) ||
        !mongoose.Types.ObjectId.isValid(specialtyId) ||
        !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    // Chuyển thời gian
    const [hour, minute] = time.split(':').map(Number);
    const appointmentTime = new Date(date);
    appointmentTime.setHours(hour, minute, 0, 0);

    // Kiểm tra giờ trống
    const exists = await Appointment.findOne({
      doctor: doctorId,
      time: appointmentTime,
      status: { $ne: 'cancelled' }
    });

    if (exists) return res.status(400).json({ error: 'Khung giờ đã được đặt' });

    const newAppointment = new Appointment({
      location: locationId,
      specialty: specialtyId,
      doctor: doctorId,
      time: appointmentTime,
      patient: { ...patient },
      status: 'scheduled'
    });

    await newAppointment.save();
    res.json({ message: 'Đặt lịch thành công', appointment: newAppointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tạo lịch khám' });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment
};
