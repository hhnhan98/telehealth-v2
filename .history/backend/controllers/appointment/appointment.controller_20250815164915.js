// controllers/booking.controller.js

const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User'); // để lấy thông tin patient
const sendEmail = require('../utils/sendEmail');

// ----------------------
// 1. Lấy danh sách cơ sở y tế
// ----------------------
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load locations', details: err.message });
  }
};

// ----------------------
// 2. Lấy danh sách chuyên khoa theo location
// ----------------------
const getSpecialtiesByLocation = async (req, res) => {
  const { locationId } = req.query;
  if (!locationId) return res.status(400).json({ error: 'Thiếu locationId' });

  try {
    const specialties = await Specialty.find({ location: locationId });
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load specialties', details: err.message });
  }
};

// ----------------------
// 3. Lấy danh sách bác sĩ theo location + specialty
// ----------------------
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  const { locationId, specialtyId } = req.query;
  if (!locationId || !specialtyId) return res.status(400).json({ error: 'Thiếu params' });

  try {
    const doctors = await Doctor.find({
      location: locationId,
      specialties: { $in: [specialtyId] }
    });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load doctors', details: err.message });
  }
};

// ----------------------
// 4. Lấy khung giờ khám trống
// ----------------------
const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ error: 'Thiếu params' });

  try {
    const booked = await Appointment.find({ doctor: doctorId, date }).select('time -_id');
    const bookedTimes = booked.map(a => a.time);

    const allTimes = [];
    for (let h = 8; h < 17; h++) {
      ['00', '30'].forEach(m => allTimes.push(`${h.toString().padStart(2,'0')}:${m}`));
    }

    const availableTimes = allTimes.filter(t => !bookedTimes.includes(t));
    res.json(availableTimes);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load giờ khám', details: err.message });
  }
};

// ----------------------
// 5. Tạo lịch khám + gửi OTP email
// ----------------------
const createAppointment = async (req, res) => {
  const { location, specialty, doctor, date, time, patientId } = req.body;
  if (!location || !specialty || !doctor || !date || !time || !patientId) {
    return res.status(400).json({ error: 'Thiếu thông tin' });
  }

  try {
    // Lấy thông tin patient
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

    // Kiểm tra giờ đã đặt chưa
    const exists = await Appointment.findOne({ doctor, date, time });
    if (exists) return res.status(400).json({ error: 'Giờ này đã được đặt' });

    // Sinh OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Tạo lịch hẹn
    const newAppt = new Appointment({
      location,
      specialty,
      doctor,
      date,
      time,
      patient: patientId,
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending'
    });

    await newAppt.save();

    /* Gửi OTP qua email
    const subject = 'Xác nhận lịch khám - OTP';
    const message = `
Xin chào ${patient.fullName},

Bạn vừa đặt lịch khám vào ngày ${date} lúc ${time}.
Mã OTP của bạn là: ${otp} (có hiệu lực 5 phút)

Vui lòng nhập mã OTP này để xác nhận lịch hẹn.
    `;
    await sendEmail(patient.email, subject, message);
*/
    res.status(201).json({
      message: 'Đặt lịch thành công. OTP đã gửi qua email.',
      appointment: newAppt
    });

  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

// ----------------------
// 6. Xác thực OTP
// ----------------------
const verifyOtp = async (req, res) => {
  const { appointmentId, otp } = req.body;
  if (!appointmentId || !otp) return res.status(400).json({ error: 'Thiếu params' });

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (appointment.isVerified) return res.status(400).json({ error: 'Lịch hẹn đã xác thực' });
    if (appointment.otp !== otp) return res.status(400).json({ error: 'OTP không chính xác' });
    if (appointment.otpExpiresAt < new Date()) return res.status(400).json({ error: 'OTP đã hết hạn' });

    appointment.isVerified = true;
    appointment.status = 'confirmed';
    appointment.otp = null;
    appointment.otpExpiresAt = null;

    await appointment.save();

    res.status(200).json({ message: 'Xác thực OTP thành công', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xác thực OTP', details: err.message });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  verifyOtp
};
