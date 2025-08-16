const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Schedule = require('../../models/Schedule');
const User = require('../../models/User');

// Giờ làm việc cố định mỗi ngày
const WORK_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// 1. Lấy danh sách cơ sở y tế
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load locations', details: err.message });
  }
};

// 2. Lấy danh sách chuyên khoa theo location
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

// 3. Lấy danh sách bác sĩ theo location + specialty
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

// 4. Lấy khung giờ khám trống (tự động tạo schedule nếu chưa có)
const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ error: 'Thiếu params' });

  const today = new Date().toISOString().split('T')[0];
  if (date < today) return res.status(400).json({ error: 'Không thể lấy slot quá khứ' });

  try {
    let schedule = await Schedule.findOne({ doctor: doctorId, date });

    if (!schedule) {
      const slots = WORK_HOURS.map(time => ({ time, isBooked: false }));
      schedule = new Schedule({ doctor: doctorId, date, slots });
      await schedule.save();
    }

    const availableSlots = schedule.slots.filter(s => !s.isBooked).map(s => s.time);
    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi load giờ khám', details: err.message });
  }
};

// 5. Tạo lịch hẹn
const createAppointment = async (req, res) => {
  const { location, specialty, doctor, date, time, patientId, patient } = req.body;

  // Kiểm tra bắt buộc
  if (!location || !specialty || !doctor || !date || !time || (!patientId && !patient)) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (date < today) return res.status(400).json({ error: 'Không thể đặt lịch quá khứ' });

  try {
    // Lấy thông tin bệnh nhân
    let patientInfo;
    if (patientId) {
      patientInfo = await User.findById(patientId).select('-password');
      if (!patientInfo) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
    } else {
      const { fullName, gender, dob, phone, email } = patient;
      if (!fullName || !gender || !dob) return res.status(400).json({ error: 'Thiếu thông tin bệnh nhân' });
      patientInfo = { fullName, gender, dob, phone, email };
    }

    // Lấy hoặc tạo schedule
    let schedule = await Schedule.findOne({ doctor, date });
    if (!schedule) {
      const slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));
      schedule = new Schedule({ doctor, date, slots });
      await schedule.save();
    }

    // Kiểm tra slot
    const slot = schedule.slots.find(s => s.time === time);
    if (!slot) return res.status(400).json({ error: 'Giờ này không có trong lịch' });
    if (slot.isBooked) return res.status(400).json({ error: 'Giờ này đã được đặt' });

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newAppt = new Appointment({
      location,
      specialty,
      doctor,
      date,
      time,
      patient: patientId
        ? { _id: patientInfo._id, fullName: patientInfo.fullName, email: patientInfo.email }
        : patientInfo,
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending',
      workScheduleId: schedule._id
    });

    await newAppt.save();

    console.log(`📌 OTP cho lịch hẹn (doctor: ${doctor}, patient: ${patientInfo.fullName}): ${otp}`);

    res.status(201).json({ message: 'Đặt lịch thành công. OTP đã gửi.', appointment: newAppt });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

// 6. Xác thực OTP
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
// 7. Hủy lịch hẹn
// ----------------------
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Thiếu appointmentId' });

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    appointment.status = 'cancelled';
    await appointment.save();

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
