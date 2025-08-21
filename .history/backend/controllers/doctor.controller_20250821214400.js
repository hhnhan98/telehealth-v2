const dayjs = require('dayjs');
const Appointment = require('../models/Appointment');
const ScheduleService = require('../services/schedule.service');
const { responseSuccess, responseError } = require('../utils/response');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// ======================= Lấy lịch làm việc bác sĩ =======================
const getWorkSchedule = async (req, res) => {
  try {
    const doctorId = req.user._id; // user._id
    const view = req.query.view || 'day';
    const todayVN = dayjs().format('YYYY-MM-DD');
    const scheduleData = [];

    if (view === 'week') {
      for (let i = 0; i < 7; i++) {
        const date = dayjs(todayVN).add(i, 'day').format('YYYY-MM-DD');
        const schedule = await ScheduleService.getOrCreateSchedule(doctorId, date);
        scheduleData.push({ date, slots: schedule.slots });
      }
    } else {
      const schedule = await ScheduleService.getOrCreateSchedule(doctorId, todayVN);
      scheduleData.push({ date: todayVN, slots: schedule.slots });
    }

    return responseSuccess(res, 'Lịch làm việc', scheduleData);
  } catch (err) {
    console.error('Lỗi lấy lịch làm việc:', err);
    return responseError(res, 'Lỗi khi lấy lịch làm việc', 500, err);
  }
};

// ======================= Cập nhật trạng thái appointment =======================
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return responseError(res, 'Trạng thái không hợp lệ', 400);
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.doctor.toString() !== doctorId.toString()) {
      return responseError(res, 'Bạn không có quyền cập nhật lịch hẹn này', 403);
    }

    // Hủy slot nếu cancelled
    if (status === 'cancelled') {
      await ScheduleService.cancelSlot(appointment.doctor, appointment.date, appointment.time);
    }

    // Book slot nếu confirmed
    if (status === 'confirmed') {
      await ScheduleService.bookSlot(appointment.doctor, appointment.date, appointment.time);
    }

    appointment.status = status;
    await appointment.save();

    return responseSuccess(res, 'Cập nhật trạng thái thành công', { appointment });
  } catch (err) {
    console.error('Lỗi updateAppointmentStatus:', err);
    return responseError(res, 'Lỗi khi cập nhật trạng thái lịch hẹn', 500, err);
  }
};

// ======================= GET /api/doctors/me =======================
const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'fullName email phone avatar bio specialty location')
      .populate('specialty', 'name')
      .populate('location', 'name');

    if (!doctor) return responseError(res, 'Không tìm thấy profile bác sĩ', 404);
    return responseSuccess(res, 'Profile bác sĩ', doctor);
  } catch (err) {
    console.error('Lỗi lấy profile:', err);
    return responseError(res, 'Lỗi lấy profile', 500, err);
  }
};

// ======================= PUT /api/doctors/me =======================
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, bio, specialty, location } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return responseError(res, 'Không tìm thấy profile bác sĩ', 404);

    // Cập nhật thông tin User ---
    const userUpdates = {};
    if (fullName) userUpdates.fullName = fullName;
    if (phone) userUpdates.phone = phone;
    if (birthYear) userUpdates.birthYear = birthYear;
    if (req.file) userUpdates.avatar = `/uploads/${req.file.filename}`;
    if (req.body.bioUser) userUpdates.bio = req.body.bioUser; // lưu bio trên User

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates, {
        new: true,
        runValidators: true,
      }).exec();
    }

    // Cập nhật thông tin Doctor
    if (bio !== undefined) doctor.bio = bio.trim();
    if (specialty) doctor.specialty = specialty;
    if (location) doctor.location = location;
    await doctor.save();

    // Lấy lại doctor + populated user
    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'fullName email phone avatar bio')
      .populate('specialty', 'name')
      .populate('location', 'name');

    return responseSuccess(res, 'Cập nhật profile thành công', updatedDoctor);
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    return responseError(res, 'Lỗi cập nhật profile', 500, err);
  }
};

module.exports = {
  getWorkSchedule,
  updateAppointmentStatus,
  getMyProfile,
  updateProfile,
};
