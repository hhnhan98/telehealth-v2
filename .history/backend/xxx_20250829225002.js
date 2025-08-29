// ===== DoctorController - Backend core logic =====
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ScheduleService = require('../services/schedule.service');
const { responseSuccess, responseError } = require('../utils/response');

// Lấy profile bác sĩ hiện tại
exports.getMyProfile = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id })
    .populate('user', 'fullName email phone avatar bio specialty location birthYear')
    .populate('specialty', 'name')
    .populate('location', 'name');
  if (!doctor) return responseError(res, 'Không tìm thấy profile', 404);
  return responseSuccess(res, 'Profile bác sĩ', doctor);
};

// Cập nhật profile bác sĩ
exports.updateProfile = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id }).populate('user');
  if (!doctor) return responseError(res, 'Không tìm thấy profile', 404);

  Object.assign(doctor.user, req.body); // Cập nhật user info
  Object.assign(doctor, req.body);      // Cập nhật doctor info
  await doctor.user.save();
  await doctor.save();

  return responseSuccess(res, 'Cập nhật profile thành công', doctor);
};

// Lấy lịch làm việc bác sĩ
exports.getWorkSchedule = async (req, res) => {
  const view = req.query.view || 'day';
  const doctorId = req.user._id;
  const scheduleData = [];

  if (view === 'week') {
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      const schedule = await ScheduleService.getOrCreateSchedule(doctorId, date);
      scheduleData.push({ date, slots: schedule.slots });
    }
  } else {
    const date = new Date();
    const schedule = await ScheduleService.getOrCreateSchedule(doctorId, date);
    scheduleData.push({ date, slots: schedule.slots });
  }

  return responseSuccess(res, 'Lịch làm việc', scheduleData);
};

// Lấy danh sách appointment của bác sĩ
exports.getDoctorAppointments = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate('patient', 'fullName email phone avatar')
    .populate('specialty', 'name')
    .populate('location', 'name')
    .sort({ datetime: 1 });
  return responseSuccess(res, 'Danh sách appointments', appointments);
};

// Cập nhật trạng thái appointment (xác nhận/hủy)
exports.updateAppointmentStatus = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findById(id);
  if (status === 'cancelled') await ScheduleService.cancelSlot(appointment.doctor, appointment.date, appointment.time);
  if (status === 'confirmed') await ScheduleService.bookSlot(appointment.doctor, appointment.date, appointment.time);

  appointment.status = status;
  await appointment.save();
  return responseSuccess(res, 'Cập nhật trạng thái thành công', appointment);
};

// Hủy appointment
exports.cancelAppointment = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  const { id } = req.params;
  const appointment = await Appointment.findById(id);

  await ScheduleService.cancelSlot(appointment.doctor, appointment.date, appointment.time);
  await appointment.remove();
  return responseSuccess(res, 'Hủy lịch hẹn thành công');
};
