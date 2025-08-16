const mongoose = require('mongoose');
const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Schedule = require('../../models/Schedule');
const User = require('../../models/User');

// Giờ làm việc cố định (30 phút/lượt)
const WORK_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// Helper: sinh OTP 6 chữ số
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// =============================
// 1. Lấy danh sách cơ sở
// =============================
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({}, 'name');
    res.json({ locations });
  } catch (err) {
    console.error('getLocations error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách cơ sở', details: err.message });
  }
};

// =============================
// 2. Lấy danh sách chuyên khoa theo cơ sở
// =============================
const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ error: 'ID cơ sở không hợp lệ' });
    }

    const specialties = await Specialty.find({ location: locationId }, 'name');
    res.json({ specialties });
  } catch (err) {
    console.error('getSpecialtiesByLocation error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách chuyên khoa', details: err.message });
  }
};

// =============================
// 3. Lấy danh sách bác sĩ theo chuyên khoa + cơ sở
// =============================
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { specialtyId, locationId } = req.query;
    if (!specialtyId || !mongoose.Types.ObjectId.isValid(specialtyId)) {
      return res.status(400).json({ error: 'ID chuyên khoa không hợp lệ' });
    }
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ error: 'ID cơ sở không hợp lệ' });
    }

    // Giữ tương thích với model Doctor có field `specialties` (mảng)
    const doctors = await Doctor.find({
      location: locationId,
      specialties: { $in: [specialtyId] }
    }, 'fullName');

    res.json({ doctors });
  } catch (err) {
    console.error('getDoctorsBySpecialtyAndLocation error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bác sĩ', details: err.message });
  }
};

// =============================
// 4. Lấy khung giờ trống (dùng Schedule model)
//    - Nếu schedule chưa có -> tạo mới với WORK_HOURS
// =============================
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'ID bác sĩ không hợp lệ' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Ngày không hợp lệ' });
    }

    // Không cho lấy slot quá khứ (so sánh chuỗi YYYY-MM-DD an toàn)
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
    console.error('getAvailableSlots error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống', details: err.message });
  }
};

// =============================
// 5. Tạo lịch hẹn
//    - Bắt buộc user login (dùng req.user.id)
//    - Kiểm tra slot tồn tại & chưa bị booked trong Schedule
//    - Tránh duplicate (nếu đã có appointment pending/confirmed cùng doctor/date/time)
//    - Sinh OTP và in ra terminal để demo
// =============================
const createAppointment = async (req, res) => {
  try {
    // Lấy patientId từ token (verifyToken đảm bảo có)
    const patientId = req.user?.id;
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(401).json({ error: 'Không có quyền hoặc user không hợp lệ' });
    }

    // Hỗ trợ cả keys legacy hoặc mới: body có thể chứa doctor hoặc doctorId...
    const doctorId = req.body.doctorId || req.body.doctor;
    const specialtyId = req.body.specialtyId || req.body.specialty;
    const locationId = req.body.locationId || req.body.location;
    const date = req.body.date;
    const time = req.body.time;

    // Validate bắt buộc
    if (!doctorId || !specialtyId || !locationId || !date || !time) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (doctor/specialty/location/date/time)' });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId) ||
        !mongoose.Types.ObjectId.isValid(specialtyId) ||
        !mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ error: 'ID bác sĩ/chuyên khoa/cơ sở không hợp lệ' });
    }

    // Kiểm tra ngày không quá khứ
    const today = new Date().toISOString().split('T')[0];
    if (date < today) return res.status(400).json({ error: 'Không thể đặt lịch quá khứ' });

    // Kiểm tra time có nằm trong WORK_HOURS
    if (!WORK_HOURS.includes(time)) {
      return res.status(400).json({ error: 'Khung giờ không hợp lệ' });
    }

    // Lấy thông tin patient từ DB
    const patientInfo = await User.findById(patientId).select('-password');
    if (!patientInfo) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

    // Tạo hoặc lấy Schedule cho bác sĩ/ngày đó
    let schedule = await Schedule.findOne({ doctor: doctorId, date });
    if (!schedule) {
      const slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));
      schedule = new Schedule({ doctor: doctorId, date, slots });
      await schedule.save();
    }

    // Kiểm tra slot tồn tại và chưa được mark booked
    const slot = schedule.slots.find(s => s.time === time);
    if (!slot) return res.status(400).json({ error: 'Giờ này không có trong lịch' });
    if (slot.isBooked) return res.status(400).json({ error: 'Giờ này đã được đặt' });

    // Bảo vệ chống duplicate: kiểm tra nếu đã có appointment pending/confirmed cùng doctor/date/time
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (existing) {
      return res.status(400).json({ error: 'Đã có lịch hẹn cho khung giờ này' });
    }

    // Sinh OTP (demo) và expiry 5 phút
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newAppt = new Appointment({
      location: locationId,
      specialty: specialtyId,
      doctor: doctorId,
      date,
      time,
      patient: {
        _id: patientInfo._id,
        fullName: patientInfo.fullName,
        email: patientInfo.email
      },
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending',
      workScheduleId: schedule._id
    });

    await newAppt.save();

    // In OTP ra terminal để demo (không gửi mail/SMS trong demo)
    console.log(`>>> OTP DEMO cho lịch hẹn ${newAppt._id} (bác sĩ: ${doctorId}, bệnh nhân: ${patientInfo.fullName}): ${otp}`);

    // Trả về object appointment theo chuẩn { appointments } hay { appointment }?
    // Chọn trả về appointment (tạo mới) để FE biết id/chi tiết.
    res.status(201).json({ message: 'Đặt lịch thành công. OTP đã in trên terminal (demo).', appointment: newAppt });
  } catch (err) {
    console.error('createAppointment error:', err);
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

// =============================
// 6. Lấy danh sách lịch hẹn của user hiện tại
//    (trả về chuẩn { appointments: [...] })
// =============================
const getAppointments = async (req, res) => {
  try {
    const patientId = req.user?.id;
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: 'User ID không hợp lệ' });
    }

    const appointments = await Appointment.find({ 'patient._id': patientId })
      .populate('doctor', 'fullName')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .sort({ date: -1, time: -1 });

    res.json({ appointments });
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách lịch hẹn', details: err.message });
  }
};

// =============================
// 7. Xác thực OTP
//    - Kiểm tra otp, expiry
//    - Nếu ok -> set isVerified + status confirmed
//    - Đánh dấu slot isBooked = true trên Schedule (qua workScheduleId nếu có)
// =============================
const verifyOtp = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;
    if (!appointmentId || !otp) return res.status(400).json({ error: 'Thiếu params' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (appointment.isVerified) return res.status(400).json({ error: 'Lịch hẹn đã xác thực' });
    if (appointment.otp !== otp) return res.status(400).json({ error: 'OTP không chính xác' });
    if (!appointment.otpExpiresAt || appointment.otpExpiresAt < new Date()) return res.status(400).json({ error: 'OTP đã hết hạn' });

    appointment.isVerified = true;
    appointment.status = 'confirmed';
    appointment.otp = null;
    appointment.otpExpiresAt = null;
    await appointment.save();

    // Mark slot booked trên Schedule (ưu tiên workScheduleId)
    if (appointment.workScheduleId) {
      const schedule = await Schedule.findById(appointment.workScheduleId);
      if (schedule) {
        const slot = schedule.slots.find(s => s.time === appointment.time);
        if (slot) slot.isBooked = true;
        await schedule.save();
      }
    } else {
      // fallback: tìm schedule theo doctor + date
      const schedule = await Schedule.findOne({ doctor: appointment.doctor, date: appointment.date });
      if (schedule) {
        const slot = schedule.slots.find(s => s.time === appointment.time);
        if (slot) {
          slot.isBooked = true;
          await schedule.save();
        }
      }
    }

    res.json({ message: 'Xác thực OTP thành công', appointment });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Lỗi khi xác thực OTP', details: err.message });
  }
};

// =============================
// 8. Hủy lịch hẹn

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Appointment ID không hợp lệ' });
    }
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(401).json({ error: 'User không hợp lệ' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    // Kiểm tra quyền: chỉ owner mới hủy
    if (!appointment.patient || String(appointment.patient._id) !== String(patientId)) {
      return res.status(403).json({ error: 'Không có quyền hủy lịch hẹn này' });
    }

    // Nếu đã confirmed và slot đã được booked -> reset isBooked
    if (appointment.workScheduleId) {
      const schedule = await Schedule.findById(appointment.workScheduleId);
      if (schedule) {
        const slot = schedule.slots.find(s => s.time === appointment.time);
        if (slot) {
          slot.isBooked = false;
          await schedule.save();
        }
      }
    } else {
      // fallback: tìm schedule theo doctor + date
      const schedule = await Schedule.findOne({ doctor: appointment.doctor, date: appointment.date });
      if (schedule) {
        const slot = schedule.slots.find(s => s.time === appointment.time);
        if (slot) {
          slot.isBooked = false;
          await schedule.save();
        }
      }
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Hủy lịch hẹn thành công', appointment });
  } catch (err) {
    console.error('cancelAppointment error:', err);
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
