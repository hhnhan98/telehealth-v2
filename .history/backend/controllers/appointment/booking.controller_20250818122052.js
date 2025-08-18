const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

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
    res.json({ locations });
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
    res.json({ specialties });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách chuyên khoa', details: err.message });
  }
};

// 3. Lấy danh sách bác sĩ theo chuyên khoa + cơ sở
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { specialtyId, locationId } = req.query;

    // Kiểm tra đầu vào
    if (!specialtyId || !locationId) {
      return res.status(400).json({ error: 'Thiếu thông tin specialtyId hoặc locationId' });
    }
    if (!mongoose.Types.ObjectId.isValid(specialtyId) || !mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    // Chuyển sang ObjectId
    const specialtyObjId = new mongoose.Types.ObjectId(specialtyId);
    const locationObjId = new mongoose.Types.ObjectId(locationId);

    // Truy vấn bác sĩ
    const doctors = await Doctor.find({
      specialty: specialtyObjId,
      location: locationObjId
    }, 'fullName');

    res.json({ doctors });
  } catch (err) {
    console.error('getDoctorsBySpecialtyAndLocation error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ', details: err.message });
  }
};


// 4. Lấy khung giờ trống
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date || !mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ error: 'Doctor ID hoặc date không hợp lệ' });

    const today = dayjs().format('YYYY-MM-DD');
    if (date < today) return res.status(400).json({ error: 'Không thể lấy slot quá khứ' });

    let schedule = await Schedule.findOne({ doctor: doctorId, date });

    if (!schedule) {
      const dayOfWeek = dayjs(date).day(); // 0=Chủ nhật
      let slots = [];
      if (dayOfWeek === 0) slots = [];
      else if (dayOfWeek === 6) slots = WORK_HOURS.slice(0,7).map(t => ({ time: t, isBooked: false }));
      else slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));

      schedule = new Schedule({doctorId, date, slots });
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
    const patientId = req.user?._id;
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId))
      return res.status(401).json({ error: 'User không hợp lệ' });

    const { doctorId, specialtyId, locationId, date, time, reason } = req.body;
    if (!doctorId || !specialtyId || !locationId || !date || !time)
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });

    const patientInfo = await User.findById(patientId).select('-password');
    if (!patientInfo) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

    const schedule = await Schedule.findOne({ doctor: doctorId, date });
    if (!schedule) return res.status(400).json({ error: 'Lịch bác sĩ chưa được tạo' });

    const slot = schedule.slots.find(s => s.time === time);
    if (!slot) return res.status(400).json({ error: 'Giờ không hợp lệ hoặc bác sĩ nghỉ' });
    if (slot.isBooked) return res.status(400).json({ error: 'Slot đã được đặt' });

    const otp = generateOTP();
    const otpExpiresAt = dayjs().add(5, 'minute').toDate();
    const datetime = dayjs.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh').toDate();

    const newAppt = new Appointment({
      location: locationId,
      specialty: specialtyId,
      doctor: doctorId,
      date,
      time,
      datetime,
      patient: patientInfo._id,
      reason,
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending'
    });

    await newAppt.save();

    slot.isBooked = true;
    await schedule.save();

    console.log(`>>> OTP DEMO: ${otp} cho lịch ${newAppt._id}`);
    res.status(201).json({ message: 'Đặt lịch thành công', appointment: newAppt });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

// 6. Lấy danh sách lịch hẹn user
const getAppointments = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: 'User không hợp lệ hoặc chưa login' });

    const appointments = await Appointment.find({ patient: userId })
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .sort({ datetime: -1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được lịch hẹn', details: err.message });
  }
};

// 7. Xác thực OTP
const verifyOtp = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;
    if (!appointmentId || !otp) return res.status(400).json({ error: 'Thiếu thông tin OTP' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (appointment.isVerified) return res.status(400).json({ error: 'Đã xác thực' });
    if (appointment.otp?.toString() !== otp) return res.status(400).json({ error: 'OTP không chính xác' });
    if (!appointment.otpExpiresAt || appointment.otpExpiresAt < new Date()) return res.status(400).json({ error: 'OTP đã hết hạn' });

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

// 8. Gửi lại OTP
const resendOtpController = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ error: 'Thiếu appointmentId' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (appointment.status !== 'pending') return res.status(400).json({ error: 'Chỉ lịch pending mới gửi OTP' });

    const otp = generateOTP();
    appointment.otp = otp;
    appointment.otpExpiresAt = dayjs().add(5, 'minute').toDate();
    await appointment.save();

    console.log(`>>> OTP DEMO RESEND: ${otp} cho lịch ${appointment._id}`);
    res.json({ message: 'OTP đã gửi lại' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi gửi lại OTP', details: err.message });
  }
};

// 9. Hủy lịch hẹn
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (appointment.patient.toString() !== userId) return res.status(403).json({ error: 'Không có quyền hủy' });
    if (!['pending', 'confirmed'].includes(appointment.status))
      return res.status(400).json({ error: `Không thể hủy lịch hẹn đang ở trạng thái '${appointment.status}'` });

    appointment.status = 'cancelled';
    await appointment.save();

    // Cập nhật slot
    const schedule = await Schedule.findOne({ doctor: appointment.doctor, date: appointment.date });
    if (schedule) {
      const slot = schedule.slots.find(s => s.time === appointment.time);
      if (slot) slot.isBooked = false;
      await schedule.save();
    }

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
  resendOtpController,
  cancelAppointment
};
