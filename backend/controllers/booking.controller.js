const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');

// 1. Lấy danh sách địa điểm
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().select('_id name address city');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách địa điểm' });
  }
};

// 2. Lấy chuyên khoa theo địa điểm
const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId) return res.status(400).json({ error: 'Thiếu locationId' });

    // Tìm bác sĩ tại địa điểm đó, lấy specialty
    const doctors = await Doctor.find({ location: locationId }).populate('specialty', '_id name');
    const specialties = [...new Map(doctors.map(doc => [doc.specialty._id, doc.specialty])).values()];

    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách chuyên khoa' });
  }
};

// 3. Lấy bác sĩ theo chuyên khoa + địa điểm
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { locationId, specialtyId } = req.query;
    if (!locationId || !specialtyId) {
      return res.status(400).json({ error: 'Thiếu locationId hoặc specialtyId' });
    }

    const doctors = await Doctor.find({ location: locationId, specialty: specialtyId })
      .select('_id name profileImage degree experience');

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ' });
  }
};

// 4. Lấy khung giờ trống của bác sĩ
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });

    // Khung giờ làm việc cố định (30 phút/lượt)
    const workHours = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Lấy lịch hẹn đã đặt
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date)
    }).select('time');

    const bookedTimes = bookedAppointments.map(a => a.time);

    // Lọc ra slot chưa bị đặt
    const availableSlots = workHours.filter(slot => !bookedTimes.includes(slot));

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống' });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots
};
