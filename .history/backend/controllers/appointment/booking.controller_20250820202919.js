const mongoose = require('mongoose');
const dayjs = require('dayjs');
const Appointment = require('../../models/Appointment');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');
const ScheduleService = require('../../services/schedule.service');
const { generateOTP } = require('../../utils/booking');
const { responseSuccess, responseError } = require('../../utils/response');

// ------------------------- Helper -------------------------
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ------------------------- Dropdown APIs -------------------------
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

    // Lọc chuyên khoa mà mảng locations có chứa locationId
    const specialties = await Specialty.find({ locations: locationId }).sort({ name: 1 });

    console.log(`[DEBUG] Specialties for location ${locationId}:`, specialties.map(s => s.name));
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

    // Lọc doctor theo specialty + location
    const doctors = await Doctor.find({ specialty: specialtyId, location: locationId })
      .populate('user', 'fullName email')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .sort({ _id: 1 })
      .lean();

    console.log(`[DEBUG] Doctors for specialty ${specialtyId} at location ${locationId}:`, doctors.map(d => d.user?.fullName));

    return responseSuccess(res, 'Danh sách bác sĩ', { count: doctors.length, doctors });
  } catch (err) {
    console.error('Lỗi [getDoctorsBySpecialtyAndLocation]:', err);
    return responseError(res, 'Lỗi khi lấy danh sách bác sĩ', 500, err);
  }
};

// ------------------------- Available Slots -------------------------
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date || !isValidObjectId(doctorId)) {
      return responseError(res, 'Doctor ID hoặc date không hợp lệ', 400);
    }
    if (dayjs(date).isBefore(dayjs(), 'day')) {
      return responseError(res, 'Không thể lấy slot quá khứ', 400);
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
    const patientId = req.user?._id;

    if (!patientId) return responseError(res, 'Token không hợp lệ hoặc hết hạn', 401);
    if (!locationId || !specialtyId || !doctorId || !date || !time) {
      return responseError(res, 'Thiếu thông tin bắt buộc', 400);
    }
    if (!isValidObjectId(locationId) || !isValidObjectId(specialtyId) || !isValidObjectId(doctorId)) {
      return responseError(res, 'ID không hợp lệ', 400);
    }

    // Kiểm tra Doctor có thuộc Specialty + Location không
    const doctor = await Doctor.findOne({ _id: doctorId, specialty: specialtyId, location: locationId }).lean();
    if (!doctor) {
      return responseError(res, 'Doctor không thuộc Specialty hoặc Location đã chọn', 400);
    }

    // Lấy danh sách slot trống từ ScheduleService
    const availableSlots = await ScheduleService.getAvailableSlots(doctorId, date);
    if (!availableSlots.includes(time)) {
      return responseError(res, 'Khung giờ đã được đặt', 400);
    }

    // Tạo OTP và Appointment
    const otp = generateOTP();
    const appointment = await Appointment.create({
      location: locationId,
      specialty: specialtyId,
      doctor: doctorId,
      patient: patientId,
      date,
      time,
      datetime: dayjs(`${date} ${time}`).toDate(),
      reason: reason || '',
      otp,
      otpExpiresAt: dayjs().add(5, 'minute').toDate(),
      status: 'pending',
      isVerified: false
    });
    
    // ---------------- OTP DEMO (development only) ----------------
    console.info(`>>> OTP DEMO của  ${appointment._id}: ${appointment.otp}`);
    
    // Đánh dấu slot đã book
    await ScheduleService.bookSlot(doctorId, date, time);

    return responseSuccess(res, 'Đặt lịch thành công', { appointment });
  } catch (err) {
    console.error('Lỗi [createAppointment]:', err);
    return responseError(res, 'Lỗi tạo lịch hẹn', 500, err);
  }
};

// ------------------------- Get Appointments -------------------------
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('location', 'name')
      .populate('specialty', 'name')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'fullName email' }
      })
      .sort({ datetime: -1 });

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
    if (appointment.status !== 'pending') return responseError(res, 'Chỉ lịch pending mới gửi OTP', 400);

    const otp = generateOTP();
    appointment.otp = otp;
    appointment.otpExpiresAt = dayjs().add(5, 'minute').toDate();
    await appointment.save();

    if (process.env.NODE_ENV === 'development') {
      console.info(`>>> OTP DEMO RESEND: ${otp} cho lịch ${appointment._id}`);
    }

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
    const patientId = req.user?._id;
    if (!patientId) return responseError(res, 'Token không hợp lệ hoặc hết hạn', 401);

    const appointment = await Appointment.findById(id);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.patient.toString() !== patientId.toString()) {
      return responseError(res, 'Không có quyền hủy', 403);
    }
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return responseError(res, `Không thể hủy lịch hẹn đang ở trạng thái '${appointment.status}'`, 400);
    }

    appointment.status = 'cancelled';
    await appointment.save();

    await ScheduleService.cancelSlot(appointment.doctor, appointment.date, appointment.time);

    return responseSuccess(res, 'Hủy lịch hẹn thành công', { appointment });
  } catch (err) {
    console.error('Lỗi [cancelAppointment]:', err);
    return responseError(res, 'Lỗi khi hủy lịch hẹn', 500, err);
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
  resendOtpController,
  cancelAppointment
};
