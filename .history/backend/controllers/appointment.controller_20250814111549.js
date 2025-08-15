const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const mongoose = require('mongoose');

// ----------------------
// 1. Lấy danh sách cơ sở y tế
// ----------------------
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error('Lỗi getLocations:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// ----------------------
// 2. Lấy danh sách chuyên khoa
// ----------------------
const getSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });
    res.json(specialties);
  } catch (err) {
    console.error('Lỗi getSpecialties:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// ----------------------
// 3. Lấy danh sách bác sĩ theo location + specialty
// ----------------------
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { locationId, specialtyId } = req.query;
    if (!locationId || !specialtyId) {
      return res.status(400).json({ error: 'Thiếu locationId hoặc specialtyId' });
    }

    const doctors = await Doctor.find({
      location: mongoose.Types.ObjectId(locationId),
      specialty: mongoose.Types.ObjectId(specialtyId)
    }).select('_id fullName profileImage degree experience');

    res.json(doctors);
  } catch (err) {
    console.error('Lỗi getDoctorsBySpecialtyAndLocation:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// ----------------------
// 4. Lấy giờ khám trống của bác sĩ theo ngày
// ----------------------
const getAvailableTimes = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });
    }

    // Khung giờ làm việc cố định 30 phút/lượt
    const workHours = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Lấy các lịch đã đặt
    const appointments = await Appointment.find({
      doctor: mongoose.Types.ObjectId(doctorId),
      time: {
        $gte: new Date(`${date}T00:00:00`),
        $lte: new Date(`${date}T23:59:59`)
      },
      status: { $ne: 'cancelled' }
    });

    const bookedTimes = appointments.map(a => {
      const d = new Date(a.time);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    });

    const availableTimes = workHours.filter(slot => !bookedTimes.includes(slot));
    res.json(availableTimes);
  } catch (err) {
    console.error('Lỗi getAvailableTimes:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// ----------------------
// 5. Tạo lịch khám mới
// ----------------------
const createAppointment = async (req, res) => {
  try {
    const { locationId, specialtyId, doctorId, date, time, patient } = req.body;

    if (!locationId || !specialtyId || !doctorId || !date || !time || !patient) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Xử lý thời gian appointment chính xác
    const [hour, minute] = time.split(':').map(Number);
    const appointmentTime = new Date(date);
    appointmentTime.setHours(hour, minute, 0, 0);

    // Kiểm tra khung giờ đã có người đặt chưa
    const exists = await Appointment.findOne({
      doctor: mongoose.Types.ObjectId(doctorId),
      time: appointmentTime,
      status: { $ne: 'cancelled' }
    });

    if (exists) return res.status(400).json({ error: 'Khung giờ đã được đặt' });

    // Xử lý patient
    let patientUserId;
    if (req.user && req.user.role === 'patient') {
      patientUserId = req.user._id;
    } else {
      const { reason, ...patientData } = patient;
      let existingUser = await User.findOne({ email: patientData.email });
      if (existingUser) {
        patientUserId = existingUser._id;
      } else {
        if (patientData.dob) patientData.dob = new Date(patientData.dob);
        const newPatient = new User({ ...patientData, role: 'patient' });
        await newPatient.save();
        patientUserId = newPatient._id;
      }
    }

    const appointment = new Appointment({
      location: mongoose.Types.ObjectId(locationId),
      specialty: mongoose.Types.ObjectId(specialtyId),
      doctor: mongoose.Types.ObjectId(doctorId),
      time: appointmentTime,
      patient: patientUserId,
      reason: patient.reason || '',
      status: 'scheduled'
    });

    await appointment.save();
    res.json({ message: 'Đặt lịch thành công', appointment });
  } catch (err) {
    console.error('Lỗi createAppointment:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = {
  getLocations,
  getSpecialties,
  getDoctorsBySpecialtyAndLocation,
  getAvailableTimes,
  createAppointment
};
