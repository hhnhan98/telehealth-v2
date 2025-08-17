const mongoose = require('mongoose');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Schedule = require('../../models/Schedule');
const User = require('../../models/User');

const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

const generateOTP = () => Math.floor(100000 + Math.random()*900000).toString();

// 1. Lấy danh sách cơ sở
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({}, 'name');
    res.json({ locations });  // trả về object có key locations
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách cơ sở', details: err.message });
  }
};

// 2. Lấy danh sách chuyên khoa theo cơ sở
const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId))
      return res.status(400).json({ error: 'ID cơ sở không hợp lệ' });

    const specialties = await Specialty.find({ location: locationId }, 'name');
    res.json({ specialties });  // trả về object có key specialties
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách chuyên khoa', details: err.message });
  }
};

// 3. Lấy danh sách bác sĩ theo chuyên khoa + cơ sở
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { specialtyId, locationId } = req.query;
    if (!specialtyId || !locationId || 
        !mongoose.Types.ObjectId.isValid(specialtyId) || 
        !mongoose.Types.ObjectId.isValid(locationId))
      return res.status(400).json({ error: 'ID không hợp lệ' });

    const doctors = await Doctor.find({
      location: locationId,
      specialties: { $in: [specialtyId] }
    }, 'fullName');

    res.json({ doctors }); // object { doctors: [...] }
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ', details: err.message });
  }
};

// 4. Lấy khung giờ trống
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date || !mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ error: 'Doctor ID hoặc date không hợp lệ' });

    const today = new Date().toISOString().split('T')[0];
    if (date < today) return res.status(400).json({ error: 'Không thể lấy slot quá khứ' });

    let schedule = await Schedule.findOne({ doctor: doctorId, date });
    if (!schedule) {
      const slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));
      schedule = new Schedule({ doctor: doctorId, date, slots });
      await schedule.save();
    }

    const availableSlots = schedule.slots.filter(s => !s.isBooked).map(s => s.time);
    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống', details: err.message });
  }
};

// 5. Tạo lịch hẹn
const createAppointment = async (req, res) => {
  try {
    const patientId = req.user?.id;
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId))
      return res.status(401).json({ error: 'User không hợp lệ' });

    const doctorId = req.body.doctorId;
    const specialtyId = req.body.specialtyId;
    const locationId = req.body.locationId;
    const date = req.body.date;
    const time = req.body.time;

    if (!doctorId || !specialtyId || !locationId || !date || !time)
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });

    const patientInfo = await User.findById(patientId).select('-password');
    if (!patientInfo) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

    const existing = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (existing) return res.status(400).json({ error: 'Đã có lịch hẹn cho slot này' });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5*60*1000);
    
    const datetime = new Date(`${date}T${time}:00.000Z`);

    const newAppt = new Appointment({
      location: locationId,
      specialty: specialtyId,
      doctor: doctorId,
      date,
      time,
      datetime,
      patient: patientInfo._id,
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending'
    });

    await newAppt.save();
    console.log(`>>> OTP DEMO: ${otp} cho lịch ${newAppt._id}`);

    res.status(201).json({ message: 'Đặt lịch thành công', appointment: newAppt });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

// 6. Lấy danh sách lịch hẹn user hiện tại
const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.find({ patient: userId })
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .sort({ date: -1, time: -1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được lịch hẹn', details: err.message });
  }
};

// 7. Xác thực OTP
const verifyOtp = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;
    if (!appointmentId || !otp) return res.status(400).json({ error: 'Thiếu params' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (appointment.isVerified) return res.status(400).json({ error: 'Đã xác thực' });
    if (appointment.otp !== otp) return res.status(400).json({ error: 'OTP không chính xác' });
    if (appointment.otpExpiresAt < new Date()) return res.status(400).json({ error: 'OTP hết hạn' });

    appointment.isVerified = true;
    appointment.status = 'confirmed';
    appointment.otp = null;
    appointment.otpExpiresAt = null;
    await appointment.save();

    res.json({ message: 'Xác thực OTP thành công', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xác thực OTP', details: err.message });
  }
};

// 8. Hủy lịch hẹn
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (String(appointment.patient) !== String(userId))
      return res.status(403).json({ error: 'Không có quyền hủy' });

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Hủy lịch hẹn thành công', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi hủy lịch hẹn', details: err.message });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  getAppointments,
  verifyOtp,
  cancelAppointment
};
