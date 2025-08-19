const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { generateOTP, WORK_HOURS, convertToUTC } = require('../../utils/bookingUtils');
const Appointment = require('../../models/Appointment');
const Schedule = require('../../models/Schedule');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');

const responseSuccess = (res, message, data = {}) => res.status(200).json({ success: true, message, data });
const responseError = (res, message, status = 400) => res.status(status).json({ success: false, message });

// ------------------------- Dropdown APIs -------------------------
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({}, 'name');
    return responseSuccess(res, 'Danh sách cơ sở', { locations });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi khi lấy danh sách cơ sở', 500); }
};

const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) return responseError(res, 'ID cơ sở không hợp lệ');
    const specialties = await Specialty.find({ location: locationId }, 'name');
    return responseSuccess(res, 'Danh sách chuyên khoa', { specialties });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi khi lấy danh sách chuyên khoa', 500); }
};

const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { specialtyId, locationId } = req.query;
    if (!specialtyId || !locationId) return responseError(res, 'Thiếu thông tin specialtyId hoặc locationId');
    if (!mongoose.Types.ObjectId.isValid(specialtyId) || !mongoose.Types.ObjectId.isValid(locationId)) return responseError(res, 'ID không hợp lệ');
    const doctors = await Doctor.find({ specialty: specialtyId, location: locationId }, 'fullName');
    return responseSuccess(res, 'Danh sách bác sĩ', { doctors });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi khi lấy danh sách bác sĩ', 500); }
};

// ------------------------- Available Slots -------------------------
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date || !mongoose.Types.ObjectId.isValid(doctorId)) return responseError(res, 'Doctor ID hoặc date không hợp lệ');
    if (dayjs(date).isBefore(dayjs(), 'day')) return responseError(res, 'Không thể lấy slot quá khứ');

    let schedule = await Schedule.findOne({ doctorId, date });
    if (!schedule) {
      const dayOfWeek = dayjs(date).day();
      let slots = [];
      if (dayOfWeek === 0) slots = []; // Chủ nhật nghỉ
      else if (dayOfWeek === 6) slots = WORK_HOURS.slice(0,7).map(t => ({ time: t, isBooked: false }));
      else slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));
      schedule = new Schedule({ doctorId, date, slots });
      await schedule.save();
    }

    const availableSlots = schedule.slots.filter(s => !s.isBooked).map(s => s.time);
    return responseSuccess(res, 'Danh sách slot trống', { availableSlots });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi khi lấy khung giờ trống', 500); }
};

// ------------------------- Create Appointment -------------------------
const createAppointment = async (req, res) => {
  try {
    const { locationId, specialtyId, doctorId, date, time, reason } = req.body;
    const patientId = req.user?._id;
    if (!patientId) return responseError(res, 'User chưa login', 401);
    if (!locationId || !specialtyId || !doctorId || !date || !time) return responseError(res, 'Thiếu thông tin bắt buộc');

    const datetime = convertToUTC(date, time);
    const otp = generateOTP();

    const appointment = await Appointment.create({
      location: locationId, specialty: specialtyId, doctor: doctorId, patient: patientId,
      datetime, date, time, reason: reason||'', otp, otpExpiresAt: dayjs().add(5,'minute').toDate(),
      status: 'pending', isVerified: false
    });

    const schedule = await Schedule.findOne({ doctorId, date });
    if (schedule) {
      const slot = schedule.slots.find(s => s.time === time);
      if (slot) { slot.isBooked = true; await schedule.save(); }
    }

    console.log(`>>> OTP DEMO: ${otp} cho lịch ${appointment._id}`);
    return responseSuccess(res, 'Đặt lịch thành công', { appointment });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi tạo lịch hẹn', 500); }
};

// ------------------------- Get Appointments -------------------------
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('location', 'name')
      .populate('specialty', 'name')
      .populate('doctor', 'fullName')
      .populate('patient', 'fullName')
      .sort({ datetime: -1 });
    return responseSuccess(res, 'Danh sách lịch hẹn', { appointments });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi khi lấy lịch hẹn', 500); }
};

// ------------------------- OTP APIs -------------------------
const verifyOtp = async (req,res) => {
  try {
    const { appointmentId, otp } = req.body;
    if (!appointmentId || !otp) return responseError(res, 'Thiếu thông tin OTP');

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.isVerified) return responseError(res, 'Đã xác thực');
    if (appointment.otp?.toString() !== otp) return responseError(res, 'OTP không chính xác');
    if (!appointment.otpExpiresAt || appointment.otpExpiresAt < new Date()) return responseError(res, 'OTP đã hết hạn');

    appointment.isVerified = true;
    appointment.status = 'confirmed';
    appointment.otp = null;
    appointment.otpExpiresAt = null;
    await appointment.save();
    return responseSuccess(res, 'Xác thực OTP thành công', { appointment });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi xác thực OTP', 500); }
};

const resendOtpController = async (req,res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return responseError(res, 'Thiếu appointmentId');

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.status !== 'pending') return responseError(res, 'Chỉ lịch pending mới gửi OTP');

    const otp = generateOTP();
    appointment.otp = otp;
    appointment.otpExpiresAt = dayjs().add(5,'minute').toDate();
    await appointment.save();
    console.log(`>>> OTP DEMO RESEND: ${otp} cho lịch ${appointment._id}`);
    return responseSuccess(res, 'OTP đã gửi lại', { appointment });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi gửi lại OTP', 500); }
};

// ------------------------- Cancel Appointment -------------------------
const cancelAppointment = async (req,res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.patient.toString() !== userId.toString()) return responseError(res, 'Không có quyền hủy', 403);
    if (!['pending','confirmed'].includes(appointment.status)) return responseError(res, `Không thể hủy lịch hẹn đang ở trạng thái '${appointment.status}'`);

    appointment.status = 'cancelled';
    await appointment.save();

    const schedule = await Schedule.findOne({ doctorId: appointment.doctor, date: appointment.date });
    if (schedule) {
      const slot = schedule.slots.find(s => s.time === appointment.time);
      if (slot) slot.isBooked = false;
      await schedule.save();
    }

    return responseSuccess(res, 'Hủy lịch hẹn thành công', { appointment });
  } catch (err) { console.error(err); return responseError(res, 'Lỗi khi hủy lịch hẹn', 500); }
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


// controllers/appointment/booking.controller.js
// const mongoose = require('mongoose');
// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');

// dayjs.extend(utc);
// dayjs.extend(timezone);

// const Location = require('../../models/Location');
// const Specialty = require('../../models/Specialty');
// const Doctor = require('../../models/Doctor');
// const Appointment = require('../../models/Appointment');
// const Schedule = require('../../models/Schedule');
// const User = require('../../models/User');

// const WORK_HOURS = [
//   '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
//   '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
// ];

// const generateOTP = () => Math.floor(100000 + Math.random()*900000).toString();

// // ------------------------- Dropdown APIs -------------------------

// const getLocations = async (req, res) => {
//   try {
//     const locations = await Location.find({}, 'name');
//     res.json({ locations });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi khi lấy danh sách cơ sở', details: err.message });
//   }
// };

// const getSpecialtiesByLocation = async (req, res) => {
//   try {
//     const { locationId } = req.query;
//     if (!locationId || !mongoose.Types.ObjectId.isValid(locationId))
//       return res.status(400).json({ error: 'ID cơ sở không hợp lệ' });

//     const specialties = await Specialty.find({ location: locationId }, 'name');
//     res.json({ specialties });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi khi lấy danh sách chuyên khoa', details: err.message });
//   }
// };

// const getDoctorsBySpecialtyAndLocation = async (req, res) => {
//   try {
//     const { specialtyId, locationId } = req.query;
//     if (!specialtyId || !locationId)
//       return res.status(400).json({ error: 'Thiếu thông tin specialtyId hoặc locationId' });
//     if (!mongoose.Types.ObjectId.isValid(specialtyId) || !mongoose.Types.ObjectId.isValid(locationId))
//       return res.status(400).json({ error: 'ID không hợp lệ' });

//     const doctors = await Doctor.find({ specialty: specialtyId, location: locationId }, 'fullName');
//     res.json({ doctors });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ', details: err.message });
//   }
// };

// // ------------------------- Available Slots -------------------------

// const getAvailableSlots = async (req, res) => {
//   try {
//     const { doctorId, date } = req.query;
//     if (!doctorId || !date || !mongoose.Types.ObjectId.isValid(doctorId))
//       return res.status(400).json({ error: 'Doctor ID hoặc date không hợp lệ' });

//     const today = dayjs().format('YYYY-MM-DD');
//     if (date < today) return res.status(400).json({ error: 'Không thể lấy slot quá khứ' });

//     let schedule = await Schedule.findOne({ doctorId, date });

//     if (!schedule) {
//       const dayOfWeek = dayjs(date).day();
//       let slots = [];
//       if (dayOfWeek === 0) slots = [];
//       else if (dayOfWeek === 6) slots = WORK_HOURS.slice(0, 7).map(t => ({ time: t, isBooked: false }));
//       else slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));

//       schedule = new Schedule({ doctorId, date, slots });
//       await schedule.save();
//     }

//     const availableSlots = schedule.slots.filter(s => !s.isBooked).map(s => s.time);
//     res.json({ availableSlots });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống', details: err.message });
//   }
// };

// // ------------------------- Create Appointment -------------------------

// const createAppointment = async (req, res) => {
//   try {
//     const { locationId, specialtyId, doctorId, date, time, reason } = req.body;
//     const patientId = req.user?._id;

//     if (!patientId) return res.status(401).json({ error: "User chưa login" });
//     if (!locationId || !specialtyId || !doctorId || !date || !time) {
//       return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
//     }

//     // Chuyển date + time sang UTC
//     const datetime = dayjs
//       .tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh")
//       .utc()
//       .toDate();

//     const otp = generateOTP();

//     // Tạo appointment mới
//     const appointment = await Appointment.create({
//       location: locationId,
//       specialty: specialtyId,
//       doctor: doctorId,
//       patient: patientId,
//       datetime,
//       date,
//       time,
//       reason: reason || "",
//       otp,
//       otpExpiresAt: dayjs().add(5, "minute").toDate(),
//       status: "pending",
//       isVerified: false,
//     });

//     // Đánh dấu slot đã booked trong Schedule nếu có
//     const schedule = await Schedule.findOne({ doctorId, date });
//     if (schedule) {
//       const slot = schedule.slots.find((s) => s.time === time);
//       if (slot) {
//         slot.isBooked = true;
//         await schedule.save();
//       }
//     }

//     console.log(`>>> OTP DEMO: ${otp} cho lịch ${appointment._id}`);

//     // Trả về FE luôn chắc chắn có appointment._id
//     res.status(201).json({
//       message: "Đặt lịch thành công",
//       appointment: {
//         _id: appointment._id,
//         location: appointment.location,
//         specialty: appointment.specialty,
//         doctor: appointment.doctor,
//         patient: appointment.patient,
//         date: appointment.date,
//         time: appointment.time,
//         status: appointment.status,
//         isVerified: appointment.isVerified,
//       },
//     });
//   } catch (err) {
//     console.error("--- CREATE APPOINTMENT ERROR ---", err);
//     res.status(500).json({ error: "Lỗi tạo lịch hẹn", details: err.message });
//   }
// };

// // ------------------------- Get Appointments -------------------------

// const getAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find({ patient: req.user._id })
//       .populate('location', 'name')       // Lấy tên cơ sở y tế
//       .populate('specialty', 'name')      // Lấy tên chuyên khoa
//       .populate('doctor', 'fullName')     // Lấy tên bác sĩ
//       .populate('patient', 'fullName')    // Lấy tên bệnh nhân (nếu cần)
//       .sort({ datetime: -1 });

//     res.status(200).json({ appointments });
//   } catch (err) {
//     console.error('getAppointments error:', err);
//     res.status(500).json({ error: 'Lỗi khi lấy lịch hẹn' });
//   }
// };

// // ------------------------- OTP APIs -------------------------

// const verifyOtp = async (req, res) => {
//   try {
//     const { appointmentId, otp } = req.body;
//     if (!appointmentId || !otp) return res.status(400).json({ error: 'Thiếu thông tin OTP' });

//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
//     if (appointment.isVerified) return res.status(400).json({ error: 'Đã xác thực' });
//     if (appointment.otp?.toString() !== otp) return res.status(400).json({ error: 'OTP không chính xác' });
//     if (!appointment.otpExpiresAt || appointment.otpExpiresAt < new Date()) return res.status(400).json({ error: 'OTP đã hết hạn' });

//     appointment.isVerified = true;
//     appointment.status = 'confirmed';
//     appointment.otp = null;
//     appointment.otpExpiresAt = null;
//     await appointment.save();

//     res.json({ message: 'Xác thực OTP thành công', appointment });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi xác thực OTP', details: err.message });
//   }
// };

// const resendOtpController = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     if (!appointmentId) return res.status(400).json({ error: 'Thiếu appointmentId' });

//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
//     if (appointment.status !== 'pending') return res.status(400).json({ error: 'Chỉ lịch pending mới gửi OTP' });

//     const otp = generateOTP();
//     appointment.otp = otp;
//     appointment.otpExpiresAt = dayjs().add(5, 'minute').toDate();
//     await appointment.save();

//     console.log(`>>> OTP DEMO RESEND: ${otp} cho lịch ${appointment._id}`);
//     res.json({ message: 'OTP đã gửi lại', appointment });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi gửi lại OTP', details: err.message });
//   }
// };

// // ------------------------- Cancel Appointment -------------------------

// const cancelAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const appointment = await Appointment.findById(id);
//     if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

//     if (appointment.patient.toString() !== userId.toString())
//       return res.status(403).json({ error: 'Không có quyền hủy' });
//     if (!['pending', 'confirmed'].includes(appointment.status))
//       return res.status(400).json({ error: `Không thể hủy lịch hẹn đang ở trạng thái '${appointment.status}'` });

//     appointment.status = 'cancelled';
//     await appointment.save();

//     // Cập nhật slot
//     const schedule = await Schedule.findOne({ doctorId: appointment.doctor, date: appointment.date });
//     if (schedule) {
//       const slot = schedule.slots.find(s => s.time === appointment.time);
//       if (slot) slot.isBooked = false;
//       await schedule.save();
//     }

//     res.json({ message: 'Hủy lịch hẹn thành công', appointment });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi khi hủy lịch hẹn', details: err.message });
//   }
// };

// module.exports = {
//   getLocations,
//   getSpecialtiesByLocation,
//   getDoctorsBySpecialtyAndLocation,
//   getAvailableSlots,
//   createAppointment,
//   getAppointments,
//   verifyOtp,
//   resendOtpController,
//   cancelAppointment
// };
