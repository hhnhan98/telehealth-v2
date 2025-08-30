const mongoose = require('mongoose');
const dayjs = require('dayjs');
const Appointment = require('../models/Appointment');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const ScheduleService = require('../services/schedule.service');
const { generateOTP } = require('../utils/booking');
const { responseSuccess, responseError } = require('../utils/response');
const { toUTC, toVN } = require('../utils/timezone');

// Helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Xử lý Dropdown APIs
// Lấy danh sách cơ sở y tế
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({}, 'name');
    return responseSuccess(res, 'Danh sách cơ sở', { count: locations.length, locations });
  } catch (err) {
    console.error('Lỗi [getLocations]:', err);
    return responseError(res, 'Lỗi khi lấy danh sách cơ sở', 500, err);
  }
};

const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId || !isValidObjectId(locationId)) {
      return responseError(res, 'ID cơ sở không hợp lệ', 400);
    }

    const specialties = await Specialty.find({ location: locationId })
      .sort({ name: 1 })
      .populate('location', 'name');

    return responseSuccess(res, 'Danh sách chuyên khoa', { count: specialties.length, specialties });
  } catch (err) {
    console.error('Lỗi [getSpecialtiesByLocation]:', err);
    return responseError(res, 'Lỗi khi lấy danh sách chuyên khoa', 500, err);
  }
};

const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { specialtyId, locationId } = req.query;
    if (!specialtyId || !locationId || !isValidObjectId(specialtyId) || !isValidObjectId(locationId)) {
      return responseError(res, 'ID chuyên khoa hoặc cơ sở không hợp lệ', 400);
    }

    const doctors = await Doctor.find({ specialty: specialtyId, location: locationId })
      .populate('user', 'fullName email')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .sort({ _id: 1 })
      .lean();

    return responseSuccess(res, 'Danh sách bác sĩ', { count: doctors.length, doctors });
  } catch (err) {
    console.error('Lỗi [getDoctorsBySpecialtyAndLocation]:', err);
    return responseError(res, 'Lỗi khi lấy danh sách bác sĩ', 500, err);
  }
};

// Lấy slots trống
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date || !isValidObjectId(doctorId)) {
      return responseError(res, 'Doctor ID hoặc date không hợp lệ', 400);
    }

    const availableSlots = await ScheduleService.getAvailableSlots(doctorId, date);
    return responseSuccess(res, 'Danh sách slot trống', { count: availableSlots.length, availableSlots });
  } catch (err) {
    console.error('Lỗi [getAvailableSlots]:', err);
    return responseError(res, 'Lỗi khi lấy khung giờ trống', 500, err);
  }
};


// ------------------------- Create Appointment -------------------------
const createAppointment = async (req, res) => {
  try {
    const { locationId, specialtyId, doctorId, date, time, reason } = req.body;

    const userId = req.user?._id;
    if (!userId) return responseError(res, 'Token không hợp lệ hoặc hết hạn', 401);

    const patient = await Patient.findOne({ user: userId });
    if (!patient) return responseError(res, 'Không tìm thấy thông tin bệnh nhân', 404);

    if (!locationId || !specialtyId || !doctorId || !date || !time)
      return responseError(res, 'Thiếu thông tin bắt buộc', 400);

    if (!isValidObjectId(locationId) || !isValidObjectId(specialtyId) || !isValidObjectId(doctorId))
      return responseError(res, 'ID không hợp lệ', 400);

    const doctor = await Doctor.findOne({ _id: doctorId, specialty: specialtyId, location: locationId }).lean();
    if (!doctor) return responseError(res, 'Doctor không thuộc Specialty hoặc Location đã chọn', 400);

    const availableSlots = await ScheduleService.getAvailableSlots(doctorId, date);
    if (!availableSlots.some(s => s.time === time)) 
      return responseError(res, 'Khung giờ đã được đặt', 400);

    const otp = generateOTP();
    const datetimeUTC = toUTC(`${date} ${time}`);

    const appointment = await Appointment.create({
      location: locationId,
      specialty: specialtyId,
      doctor: doctorId,
      patient: patient._id,
      datetime: datetimeUTC,
      reason: reason || '',
      otp,
      otpExpiresAt: dayjs().add(5, 'minute').toDate(),
      status: 'pending',
      isVerified: false
    });

    console.info(`>>> OTP DEMO của Lịch hẹn: ${appointment._id} là: ${appointment.otp}`);

    await ScheduleService.bookSlot(doctorId, date, time);

    const appointmentData = appointment.toObject();
    appointmentData.datetimeVN = toVN(appointment.datetime);

    return responseSuccess(res, 'Đặt lịch thành công', { appointment: appointmentData });
  } catch (err) {
    console.error('Lỗi [createAppointment]:', err);
    return responseError(res, 'Lỗi tạo lịch hẹn', 500, err);
  }
};

// ------------------------- Get Appointments -------------------------
const getAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return responseError(res, 'Không tìm thấy thông tin bệnh nhân', 404);

    const appointments = await Appointment.find({ patient: patient._id })
      .populate('location', 'name')
      .populate('specialty', 'name')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'fullName email' }
      })
      .sort({ datetime: -1 })
      .lean();

    appointments.forEach(a => { a.datetimeVN = toVN(a.datetime); });

    return responseSuccess(res, 'Danh sách lịch hẹn', { count: appointments.length, appointments });
  } catch (err) {
    console.error('Lỗi [getAppointments]:', err);
    return responseError(res, 'Lỗi khi lấy lịch hẹn', 500, err);
  }
};

// ------------------------- OTP APIs -------------------------
const verifyOtp = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;
    if (!appointmentId || !otp) return responseError(res, 'Thiếu appointmentId hoặc otp', 400);

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    // Check quá hạn
    if (appointment.datetime < new Date()) {
      appointment.status = 'expired';
      await appointment.save();
      return responseError(res, 'Lịch hẹn đã quá hạn, không thể xác thực', 400);
    }    

    if (appointment.isVerified) return responseError(res, 'Lịch hẹn đã xác thực', 400);
    if (appointment.otp !== otp) return responseError(res, 'OTP không chính xác', 400);
    if (!appointment.otpExpiresAt || appointment.otpExpiresAt < new Date()) return responseError(res, 'OTP đã hết hạn', 400);

    appointment.isVerified = true;
    appointment.status = 'confirmed';
    appointment.otp = null;
    appointment.otpExpiresAt = null;
    await appointment.save();

    return responseSuccess(res, 'Xác thực OTP thành công', { appointment });
  } catch (err) {
    console.error('Lỗi [verifyOtp]:', err);
    return responseError(res, 'Lỗi xác thực OTP', 500, err);
  }
};

const resendOtpController = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return responseError(res, 'Thiếu appointmentId', 400);

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);

    // Check quá hạn
    if (appointment.datetime < new Date()) {
      appointment.status = 'expired';
      await appointment.save();
      return responseError(res, 'Lịch hẹn đã quá hạn, không thể gửi lại OTP', 400);
    }

    if (appointment.status !== 'pending') return responseError(res, 'Chỉ lịch pending mới gửi OTP', 400);

    const otp = generateOTP();
    appointment.otp = otp;
    appointment.otpExpiresAt = dayjs().add(5, 'minute').toDate();
    await appointment.save();

    console.info(`>>> OTP DEMO RESEND: ${otp} cho lịch ${appointment._id}`);

    return responseSuccess(res, 'OTP đã gửi lại', { appointment });
  } catch (err) {
    console.error('Lỗi [resendOtpController]:', err);
    return responseError(res, 'Lỗi gửi lại OTP', 500, err);
  }
};

// ------------------------- Cancel Appointment -------------------------
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return responseError(res, 'Không tìm thấy thông tin bệnh nhân', 404);

    const appointment = await Appointment.findById(id);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.patient.toString() !== patient._id.toString()) return responseError(res, 'Không có quyền hủy', 403);
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return responseError(res, `Không thể hủy lịch hẹn đang ở trạng thái '${appointment.status}'`, 400);
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return responseSuccess(res, 'Hủy lịch hẹn thành công', { appointment });
  } catch (err) {
    console.error('Lỗi [cancelAppointment]:', err);
    return responseError(res, 'Lỗi khi hủy lịch hẹn', 500, err);
  }
};

// ------------------------- Get Appointment by ID -------------------------
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return responseError(res, 'ID không hợp lệ', 400);

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return responseError(res, 'Không tìm thấy thông tin bệnh nhân', 404);

    const appointment = await Appointment.findById(id)
      .populate('location', 'name')
      .populate('specialty', 'name')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'fullName email' }
      })
      .populate('patient', 'fullName birthYear address phone');;

    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.patient.toString() !== patient._id.toString()) return responseError(res, 'Không có quyền xem lịch hẹn này', 403);

    const appointmentData = appointment.toObject();
    appointmentData.datetimeVN = toVN(appointment.datetime);

    return responseSuccess(res, 'Chi tiết lịch hẹn', { appointment: appointmentData });
  } catch (err) {
    console.error('Lỗi [getAppointmentById]:', err);
    return responseError(res, 'Lỗi khi lấy chi tiết lịch hẹn', 500, err);
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  getAppointments,
  getAppointmentById,
  verifyOtp,
  resendOtpController,
  cancelAppointment
};