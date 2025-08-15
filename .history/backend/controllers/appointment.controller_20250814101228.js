const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');

// Lấy danh sách cơ sở y tế
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Lấy danh sách chuyên khoa
const getSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });
    res.json(specialties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Lấy danh sách bác sĩ theo chuyên khoa
const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;
    if (!specialty) return res.status(400).json({ error: 'Thiếu chuyên khoa' });
    const doctors = await Doctor.find({ specialty }).select('fullName');
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Lấy giờ trống của bác sĩ theo ngày
const getAvailableTimes = async (req, res) => {
  try {
    const { doctor, date } = req.query;
    if (!doctor || !date) return res.status(400).json({ error: 'Thiếu bác sĩ hoặc ngày' });

    const start = new Date(date);
    start.setHours(8, 0, 0, 0);
    const end = new Date(date);
    end.setHours(17, 0, 0, 0);

    const appointments = await Appointment.find({
      doctor,
      time: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    });

    const bookedHours = appointments.map(a => a.time.getHours());
    const allHours = [];
    for (let h = 8; h <= 17; h++) allHours.push(`${h}:00`);
    const available = allHours.filter((_, i) => !bookedHours.includes(8 + i));

    res.json(available);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Tạo lịch khám
const createAppointment = async (req, res) => {
  try {
    const { location, specialty, doctor, date, time, patient } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!location || !specialty || !doctor || !date || !time || !patient) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Chuyển dob từ string sang Date nếu có
    if (patient.dob) {
      patient.dob = new Date(patient.dob);
    }

    // Kiểm tra giờ trống
    const [hour, minute] = time.split(':').map(Number);
    const appointmentTime = new Date(date);
    appointmentTime.setHours(hour, minute, 0, 0);

    const start = new Date(appointmentTime);
    const end = new Date(appointmentTime);
    end.setMinutes(59, 59, 999);

    const exists = await Appointment.findOne({
      doctor,
      time: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    });

    if (exists) {
      return res.status(400).json({ error: 'Khung giờ đã được đặt' });
    }

    // Xác định patient user
    let patientUser;
    if (req.user && req.user.role === 'patient') {
      // Bệnh nhân đăng nhập
      patientUser = req.user._id;
    } else {
      // Tạo user mới nếu chưa có
      // Loại bỏ trường không thuộc schema User (ví dụ reason)
      const { reason, ...patientData } = patient;

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email: patientData.email });
      if (existingUser) {
        patientUser = existingUser._id;
      } else {
        const newPatient = new User({ ...patientData, role: 'patient' });
        await newPatient.save();
        patientUser = newPatient._id;
      }
    }

    // Tạo appointment mới
    const appointment = new Appointment({
      location,
      specialty,
      doctor,
      time: appointmentTime,
      patient: patientUser,
      reason: patient.reason || '',
      status: 'scheduled'
    });

    await appointment.save();

    res.json({ message: 'Đặt lịch thành công', appointment });
  } catch (err) {
    console.error('Lỗi tạo appointment:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = {
  getLocations: require('./appointment.controller').getLocations,
  getSpecialties: require('./appointment.controller').getSpecialties,
  getDoctorsBySpecialty: require('./appointment.controller').getDoctorsBySpecialty,
  getAvailableTimes: require('./appointment.controller').getAvailableTimes,
  createAppointment
};
};
