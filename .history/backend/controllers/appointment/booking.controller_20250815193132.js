const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Schedule = require('../../models/Schedule');
const User = require('../../models/User');
const sendEmail = require('../../utils/sendEmail');

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
// 4. Lấy khung giờ khám trống dựa trên WorkSchedule
// ----------------------
const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ error: 'Thiếu params' });

  try {
    // Lấy schedule của bác sĩ trong ngày
    const schedule = await Schedule.findOne({ doctor: doctorId, date });
    if (!schedule) return res.status(404).json({ error: 'Không có lịch làm việc cho ngày này' });

    // Lọc slot chưa booked
    const availableSlots = schedule.slots
      .filter(slot => !slot.isBooked)
      .map(slot => slot.time);

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load giờ khám', details: err.message });
  }
};

// ----------------------
// 5. Tạo lịch khám + sinh OTP + gắn WorkSchedule
// ----------------------
const createAppointment = async (req, res) => {
  const { location, specialty, doctor, date, time, patientId, patient } = req.body;

  if (!location || !specialty || !doctor || !date || !time || (!patientId && !patient)) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const patientInfo = patientId
      ? await User.findById(patientId).select('-password')
      : patient;

    if (!patientInfo) return res.status(404).json({ error: 'Không tìm thấy thông tin bệnh nhân' });

    // Lấy schedule
    const schedule = await Schedule.findOne({ doctor, date });
    if (!schedule) return res.status(404).json({ error: 'Bác sĩ chưa có lịch làm việc ngày này' });

    // Kiểm tra slot còn trống
    const slot = schedule.slots.find(s => s.time === time);
    if (!slot) return res.status(400).json({ error: 'Giờ này không có trong lịch làm việc' });
    if (slot.isBooked) return res.status(400).json({ error: 'Giờ này đã được đặt' });

    // Sinh OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Tạo appointment
    const newAppt = new Appointment({
      location,
      specialty,
      doctor,
      date,
      time,
      patient: patientInfo,
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending',
      workScheduleId: schedule._id
    });

    await newAppt.save();

    res.status(201).json({
      message: 'Đặt lịch thành công. OTP đã gửi qua email.',
      appointment: newAppt
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

// ----------------------
// 6. Xác thực OTP + confirm appointment + update slot
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

    // Cập nhật slot trong schedule
    if (appointment.workScheduleId) {
      const schedule = await Schedule.findById(appointment.workScheduleId);
      const slot = schedule.slots.find(s => s.time === appointment.time);
      if (slot) slot.isBooked = true;
      await schedule.save();
    }

    res.status(200).json({ message: 'Xác thực OTP thành công', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xác thực OTP', details: err.message });
  }
};

// ----------------------
// 7. Cancel appointment
// ----------------------
const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) return res.status(400).json({ error: 'Thiếu appointmentId' });

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    appointment.status = 'cancelled';
    await appointment.save();

    // Update slot
    if (appointment.workScheduleId) {
      const schedule = await Schedule.findById(appointment.workScheduleId);
      const slot = schedule.slots.find(s => s.time === appointment.time);
      if (slot) slot.isBooked = false;
      await schedule.save();
    }

    res.status(200).json({ message: 'Hủy lịch hẹn thành công', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi hủy lịch hẹn', details: err.message });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  verifyOtp,
  cancelAppointment
};
