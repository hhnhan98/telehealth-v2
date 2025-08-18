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

    // Kiểm tra input
    if (!doctorId || !date || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'Doctor ID hoặc date không hợp lệ' });
    }

    const today = dayjs().format('YYYY-MM-DD');
    if (date < today) return res.status(400).json({ error: 'Không thể lấy slot quá khứ' });

    // Tìm schedule hiện tại
    let schedule = await Schedule.findOne({ doctorId, date });

    // Nếu chưa có, tự sinh schedule cố định theo giờ hành chính
    if (!schedule) {
      const dayOfWeek = dayjs(date).day(); // 0 = Chủ nhật
      let slots = [];

      if (dayOfWeek === 0) {
        // Chủ nhật: nghỉ
        slots = [];
      } else if (dayOfWeek === 6) {
        // Thứ 7: chỉ sáng
        slots = WORK_HOURS.slice(0, 7).map(t => ({ time: t, isBooked: false }));
      } else {
        // Thứ 2-6: toàn bộ khung giờ
        slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));
      }

      schedule = new Schedule({ doctorId, date, slots });
      await schedule.save();
    }

    // Lọc slot chưa được book
    const availableSlots = schedule.slots
      .filter(s => !s.isBooked)createAppointment 
      .map(s => s.time);

    res.json({ availableSlots });

  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống', details: err.message });
  }
};

// 5. Tạo lịch hẹn
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, patientId, reason, patient } = req.body;

    console.log('>>> Payload received:', req.body);

    // Kiểm tra input cơ bản
    if (!doctorId || !date || !time || (!patientId && !patient)) {
      console.error('>>> Missing required fields');
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      console.error('>>> Invalid doctorId:', doctorId);
      return res.status(400).json({ error: 'Doctor ID không hợp lệ' });
    }

    // Kiểm tra patientId nếu có
    if (patientId && !mongoose.Types.ObjectId.isValid(patientId)) {
      console.error('>>> Invalid patientId:', patientId);
      return res.status(400).json({ error: 'Patient ID không hợp lệ' });
    }

    // Ngày không quá khứ
    const today = dayjs().format('YYYY-MM-DD');
    if (date < today) {
      console.error('>>> Date is in the past:', date);
      return res.status(400).json({ error: 'Không thể đặt lịch cho ngày quá khứ' });
    }

    // Lấy hoặc tạo schedule
    let schedule = await Schedule.findOne({ doctorId, date });
    console.log('>>> Schedule found:', schedule);

    if (!schedule) {
      const dayOfWeek = dayjs(date).day(); // 0 = Chủ nhật
      let slots = [];
      const WORK_HOURS = [
        '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
        '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
      ];

      if (dayOfWeek === 0) slots = [];
      else if (dayOfWeek === 6) slots = WORK_HOURS.slice(0, 7).map(t => ({ time: t, isBooked: false }));
      else slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));

      schedule = new Schedule({ doctorId, date, slots });
      await schedule.save();
      console.log('>>> Schedule created:', schedule);
    }

    // Kiểm tra slot còn trống
    const slotIndex = schedule.slots.findIndex(s => s.time === time && !s.isBooked);
    if (slotIndex === -1) {
      console.error('>>> Slot not available or already booked:', time);
      return res.status(400).json({ error: 'Slot đã được đặt hoặc không tồn tại' });
    }

    // Chuyển giờ VN sang UTC
    const datetimeUTC = dayjs.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh").utc().toDate();

    // Chuẩn bị patientId hoặc tạo patient object
    let finalPatientId = patientId;
    if (!finalPatientId && patient) {
      // Nếu guest, bạn có thể tạo User mới hoặc lưu trực tiếp object patient
      // Đây là ví dụ lưu trực tiếp object (phải phù hợp schema)
      console.log('>>> Guest patient:', patient);
    }

    // Tạo appointment
    let appointment;
    try {
      appointment = await Appointment.create({
        doctor: doctorId,
        patient: finalPatientId || patient,
        date,
        time,
        datetime: datetimeUTC,
        reason: reason || '',
        status: 'pending',
        isVerified: false
      });
    } catch (err) {
      console.error('>>> Appointment.create failed:', err);
      return res.status(500).json({ error: 'Lỗi khi tạo lịch hẹn', details: err.message });
    }

    // Cập nhật slot thành booked
    schedule.slots[slotIndex].isBooked = true;
    await schedule.save();

    console.log('>>> Appointment created successfully:', appointment);
    res.status(201).json({ appointment });

  } catch (err) {
    console.error('>>> createAppointment unexpected error:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo lịch hẹn', details: err.message });
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
