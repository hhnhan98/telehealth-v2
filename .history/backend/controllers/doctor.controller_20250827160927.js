const dayjs = require('dayjs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

const ScheduleService = require('../services/schedule.service');
const { responseSuccess, responseError } = require('../utils/response');

// ===== PROFILE =====

// GET /api/doctors/me
const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'fullName email phone avatar bio specialty location birthYear')
      .populate('specialty', 'name')
      .populate('location', 'name');

    if (!doctor) return responseError(res, 'Không tìm thấy profile bác sĩ', 404);
    return responseSuccess(res, 'Profile bác sĩ', doctor.toObject({ virtuals: true }));
  } catch (err) {
    console.error('Lỗi lấy profile:', err);
    return responseError(res, 'Lỗi lấy profile', 500, err);
  }
};

// PUT /api/doctors/me
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, bio, specialty, location, birthYear, bioUser } = req.body;

    const parseBirthYear = (value) => {
      const n = Number(value);
      return !isNaN(n) ? n : null;
    };

    let doctor = await Doctor.findOne({ user: req.user._id }).populate('user');

    if (!doctor) {
      doctor = new Doctor({
        user: req.user._id,
        specialty: specialty || null,
        location: location || null,
        bio: bio?.trim() || '',
      });
      await doctor.save();
      await doctor.populate('user');
    }

    if (!doctor.user) return responseError(res, 'User liên kết với Doctor không tồn tại', 404);

    const userUpdates = {};
    if (fullName !== undefined) userUpdates.fullName = fullName.trim();
    if (phone !== undefined) userUpdates.phone = phone.trim();
    if (birthYear !== undefined) userUpdates.birthYear = parseBirthYear(birthYear);
    if (req.file) userUpdates.avatar = `/uploads/${req.file.filename}`;
    if (bioUser !== undefined) userUpdates.bio = bioUser.trim();

    if (Object.keys(userUpdates).length > 0) {
      Object.assign(doctor.user, userUpdates);
      await doctor.user.save();
    }

    if (bio !== undefined) doctor.bio = bio.trim();
    if (specialty !== undefined) doctor.specialty = specialty;
    if (location !== undefined) doctor.location = location;
    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'fullName email phone avatar bio birthYear')
      .populate('specialty', 'name')
      .populate('location', 'name');

    return responseSuccess(
      res,
      'Cập nhật profile thành công',
      updatedDoctor.toObject({ virtuals: true })
    );
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    return responseError(res, 'Lỗi cập nhật profile', 500, err);
  }
};

// PUT /api/doctors/me/password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { current, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return responseError(res, 'Người dùng không tồn tại', 404);

    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) return responseError(res, 'Mật khẩu hiện tại không đúng', 400);

    user.password = newPassword;
    await user.save();

    return responseSuccess(res, 'Đổi mật khẩu thành công');
  } catch (err) {
    console.error('Lỗi changePassword:', err);
    return responseError(res, 'Lỗi khi đổi mật khẩu', 500, err);
  }
};

// ===== WORK SCHEDULE =====
const getWorkSchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;
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

// ===== APPOINTMENT =====

// GET /api/doctors/appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return responseError(res, 'Không tìm thấy doctor', 404);

    // Chỉ lấy lịch có trạng thái confirmed, completed
    const appointments = await Appointment.find({
      doctor: doctor._id, 
      status: { $in: ['confirmed', 'completed'] }
    })
      .populate('patient', 'fullName email phone avatar')
      .populate('location', 'name')
      .populate('specialty', 'name')
      .sort({ datetime: 1 });

    return responseSuccess(res, 'Danh sách lịch hẹn', { count: appointments.length, appointments });
  } catch (err) {
    console.error('Lỗi getDoctorAppointments:', err);
    return responseError(res, 'Lỗi khi lấy danh sách lịch hẹn', 500, err);
  }
};

// GET /api/doctors/appointments/:id
const getAppointmentDetail = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return responseError(res, 'Không tìm thấy doctor', 404);

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName email phone avatar')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'fullName email'}
      })
      .populate('location', 'name')
      .populate('specialty', 'name');

    console.log('Doctor đang truy cập:', doctor._id);
    console.log('Appointment tìm thấy:', appointment);

    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.doctor._id.toString() !== doctor._id.toString())
      return responseError(res, 'Bạn không có quyền xem lịch hẹn này', 403);

    console.log('>>> Appointment detail response:', appointment.toObject({ virtuals: true }));

    return responseSuccess(res, 'Chi tiết lịch hẹn', appointment);
  } catch (err) {
    console.error('Lỗi getAppointmentDetail:', err);
    return responseError(res, 'Lỗi khi lấy chi tiết lịch hẹn', 500, err);
  }
};

// PATCH /api/doctors/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return responseError(res, 'Không tìm thấy doctor', 404);

    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status))
      return responseError(res, 'Trạng thái không hợp lệ', 400);

    const appointment = await Appointment.findById(id);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.doctor.toString() !== doctor._id.toString())
      return responseError(res, 'Bạn không có quyền cập nhật lịch hẹn này', 403);

    if (status === 'cancelled') {
      await ScheduleService.cancelSlot(appointment.doctor, appointment.date, appointment.time);
    }
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

// DELETE /api/doctors/appointments/:id
const cancelAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return responseError(res, 'Không tìm thấy doctor', 404);

    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.doctor.toString() !== doctor._id.toString())
      return responseError(res, 'Bạn không có quyền hủy lịch hẹn này', 403);

    await ScheduleService.cancelSlot(appointment.doctor, appointment.date, appointment.time);
    await appointment.remove();

    return responseSuccess(res, 'Hủy lịch hẹn thành công');
  } catch (err) {
    console.error('Lỗi cancelAppointment:', err);
    return responseError(res, 'Lỗi khi hủy lịch hẹn', 500, err);
  }
};

// POST /api/doctors/appointments/:id/medical-receipt
const createMedicalReceipt = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return responseError(res, 'Không tìm thấy doctor', 404);

    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return responseError(res, 'Không tìm thấy lịch hẹn', 404);
    if (appointment.doctor.toString() !== doctor._id.toString())
      return responseError(res, 'Bạn không có quyền tạo phiếu khám cho lịch hẹn này', 403);

    appointment.medicalReceipt = req.body; // lưu nguyên body vào medicalReceipt
    appointment.status = 'completed';
    await appointment.save();

    return responseSuccess(res, 'Tạo phiếu khám thành công', appointment);
  } catch (err) {
    console.error('Lỗi createMedicalReceipt:', err);
    return responseError(res, 'Lỗi khi tạo phiếu khám', 500, err);
  }
};

// GET /api/doctors/appointments/by-date?date=YYYY-MM-DD
const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    console.log('>>> Query date:', date);
    console.log('>>> Logged user:', req.user);

    if (!date) return res.status(400).json({ success: false, message: 'Thiếu ngày' });

    // Tìm doctor theo user đang login
    const doctor = await Doctor.findOne({ user: req.user._id });
    console.log('>>> Doctor found:', doctor);
    if (!doctor) return res.status(404).json({ success: false, message: 'Không tìm thấy doctor' });

    // Chuyển date từ FE sang khoảng UTC
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    console.log('>>> UTC range:', startOfDay, endOfDay);

    // Query appointments (trước tiên không populate để kiểm tra)
    let appointmentsRaw = await Appointment.find({
      doctor: doctor._id,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'completed'] },
    }).lean();
    console.log('>>> Raw appointments:', appointmentsRaw);

    // Populate patient thông tin, bỏ qua những patient lỗi (nếu có)
    const appointments = await Appointment.populate(appointmentsRaw, {
      path: 'patient',
      select: 'fullName email phone avatar',
      options: { lean: true }
    });

    console.log('>>> Appointments populated:', appointments.length);

    return res.status(200).json({
      success: true,
      message: 'Lịch hẹn theo ngày',
      data: { appointments }
    });
  } catch (err) {
    console.error('>>> ERROR getAppointmentsByDate:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết lịch hẹn',
      error: err.message
    });
  }
};

// ====== QUẢN LÝ BỆNH NHÂN =====
// Lấy danh sách bệnh nhân do bác sĩ phụ trách
// const getMyPatients = async (req, res) => {
//   try {
//     // Tìm doctor theo user hiện tại
//     const doctor = await Doctor.findOne({ user: req.user._id });
//     console.log(">>> Logged doctor:", doctor?._id, "from user:", req.user._id);

//     if (!doctor) return responseError(res, 'Không tìm thấy doctor', 404);

//     // Lấy danh sách appointments đã hoàn thành
//     const appointments = await Appointment.find({
//       doctor: doctor._id,
//       status: 'completed',
//     }).select('patient doctor status').lean();

//     console.log(">>> Appointments completed:", appointments);

//     if (!appointments || appointments.length === 0) {
//       return responseSuccess(res, 'Không có bệnh nhân nào', []);
//     }

//     // Lấy các patientId duy nhất
//     const patientIds = [...new Set(appointments.map(a => a.patient?.toString()))];
//     console.log(">>> Patient IDs:", patientIds);

//     if (patientIds.length === 0) {
//       return responseSuccess(res, 'Không tìm thấy bệnh nhân từ appointments', []);
//     }

//     // Lấy thông tin Patient + User liên kết
//     const patients = await Patient.find({ user: { $in: patientIds } })
//       .populate('user', 'fullName birthYear phone avatar email')
//       .lean();

//     console.log(">>> Patients populated:", patients);

//     // Format dữ liệu trả về
//     const data = patients.map(p => ({
//       _id: p._id,
//       fullName: p.user?.fullName || '',
//       birthYear: p.user?.birthYear || null,
//       phone: p.user?.phone || '',
//       avatar: p.user?.avatar || '',
//       email: p.user?.email || '',
//       address: p.address || '',
//       bio: p.bio || '',
//     }));

//     console.log(">>> Data gửi về FE:", data);

//     return responseSuccess(res, 'Danh sách bệnh nhân', data);
//   } catch (err) {
//     console.error('❌ getMyPatients error:', err);
//     return responseError(res, 'Có lỗi xảy ra khi lấy danh sách bệnh nhân', 500, err.message);
//   }
// };

// Lấy danh sách phiếu khám của 1 bệnh nhân
const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return responseError(res, 'ID bệnh nhân không hợp lệ', 400);
    }

    // Lấy tất cả medical records của bệnh nhân
    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'fullName specialty location') // bác sĩ
      .populate({
        path: 'appointment',
        select: 'date time specialty location doctor',
        populate: [
          { path: 'specialty', select: 'name' },
          { path: 'location', select: 'name' },
        ],
      })
      .sort({ date: -1 }) // mới -> cũ
      .lean();

    // Format dữ liệu cho FE
    const data = records.map(r => ({
      _id: r._id,
      date: r.date,
      doctorName: r.doctor?.fullName || '',
      specialtyName: r.appointment?.specialty?.name || '',
      locationName: r.appointment?.location?.name || '',
    }));

    return responseSuccess(res, 'Danh sách phiếu khám bệnh', data);
  } catch (err) {
    console.error('getMedicalRecordsByPatient error:', err);
    return responseError(res, 'Có lỗi xảy ra khi lấy lịch sử khám bệnh', 500);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  changePassword,
  getWorkSchedule,
  getDoctorAppointments,
  getAppointmentDetail,
  updateAppointmentStatus,
  cancelAppointment,
  createMedicalReceipt,
  getAppointmentsByDate,
  getMyPatients,
  getMedicalRecordsByPatient
};