const dayjs = require('dayjs');
const Appointment = require('../models/Appointment');
const ScheduleService = require('../services/schedule.service');
const { responseSuccess, responseError } = require('../utils/response');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Lấy lịch làm việc của bác sĩ
const getWorkSchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const view = req.query.view || 'day';
    const todayVN = dayjs().format('YYYY-MM-DD');
    const scheduleData = [];

    if (view === 'week') {
      // Lịch cho 7 ngày tới
      for (let i = 0; i < 7; i++) {
        const date = dayjs(todayVN).add(i, 'day').format('YYYY-MM-DD');
        const schedule = await ScheduleService.getOrCreateSchedule(doctorId, date);
        scheduleData.push({ date, slots: schedule.slots });
      }
    } else {
      // Chỉ hôm nay
      const schedule = await ScheduleService.getOrCreateSchedule(doctorId, todayVN);
      scheduleData.push({ date: todayVN, slots: schedule.slots });
    }

    return responseSuccess(res, 'Lịch làm việc', scheduleData);
  } catch (err) {
    console.error('Lỗi lấy lịch làm việc:', err);
    return responseError(res, 'Lỗi khi lấy lịch làm việc', 500, err);
  }
};

// Bác sĩ cập nhật trạng thái lịch hẹn
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

    // Nếu hủy, release slot
    if (status === 'cancelled') {
      await ScheduleService.cancelSlot(appointment.doctor, appointment.date, appointment.time);
    }

    // Nếu xác nhận, book slot (nếu chưa booked)
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

// GET /api/doctors/me
const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'fullName email phone avatar')
      .populate('specialty', 'name')
      .populate('location', 'name');

    console.log('DEBUG doctor profile:', doctor);

    if (!doctor) return responseError(res, 'Không tìm thấy profile bác sĩ', 404);
    return responseSuccess(res, 'Profile bác sĩ', doctor);
  } catch (err) {
    return responseError(res, 'Lỗi lấy profile', 500, err);
  }
};

// PUT /api/doctors/me
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, bio } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return responseError(res, 'Không tìm thấy profile bác sĩ', 404);

    // --- Cập nhật thông tin user ---
    const userUpdates = {};
    if (fullName) userUpdates.fullName = fullName;
    if (phone) userUpdates.phone = phone;
    if (req.file) userUpdates.avatar = `/uploads/${req.file.filename}`;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates, {
        new: true,
        runValidators: true
      }).exec();
    }

    // --- Cập nhật thông tin doctor ---
    if (bio !== undefined) {
      doctor.bio = bio.trim();
      await doctor.save();
    }

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'fullName email phone avatar')
      .populate('specialty', 'name')
      .populate('location', 'name');

    return responseSuccess(res, 'Cập nhật profile thành công', updatedDoctor);
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    return responseError(res, 'Lỗi cập nhật profile', 500, err);
  }
};


module.exports = { getWorkSchedule, updateAppointmentStatus, getMyProfile, updateProfile };
// // ----------------- Helper -----------------
// const generateTimeSlots = () => {
//   const slots = [];

//   // Buổi sáng
//   for (let hour = 8; hour < 11; hour++) {
//     slots.push(`${hour.toString().padStart(2,'0')}:00`);
//     slots.push(`${hour.toString().padStart(2,'0')}:30`);
//   }
//   slots.push('11:00');

//   // Buổi chiều
//   for (let hour = 13; hour < 17; hour++) {
//     slots.push(`${hour.toString().padStart(2,'0')}:00`);
//     slots.push(`${hour.toString().padStart(2,'0')}:30`);
//   }
//   slots.push('17:00');

//   return slots;
// };

// // ----------------- API: Lấy lịch làm việc -----------------
// const getWorkSchedule = async (req, res) => {
//   try {
//     const doctorId = req.user._id;
//     const view = req.query.view || 'day';

//     const vnOffset = 7 * 60; // phút

//     const nowUTC = new Date();

//     // --- Helper convert VN ↔ UTC ---
//     const toUTC = (dateVN) => new Date(dateVN.getTime() - vnOffset * 60000);
//     const toVN = (dateUTC) => new Date(dateUTC.getTime() + vnOffset * 60000);

//     // --- Xác định start/end date VN ---
//     let startVN, endVN;

//     if (view === 'week') {
//       // Tính thứ 2 → CN tuần hiện tại VN
//       const todayVN = toVN(nowUTC);
//       const dayOfWeekVN = (todayVN.getDay() + 6) % 7; // 0=CN, 1=T2
//       startVN = new Date(todayVN);
//       startVN.setDate(todayVN.getDate() - dayOfWeekVN);
//       startVN.setHours(0, 0, 0, 0);

//       endVN = new Date(startVN);
//       endVN.setDate(startVN.getDate() + 6);
//       endVN.setHours(23, 59, 59, 999);
//     } else {
//       // Chỉ hôm nay
//       const todayVN = toVN(nowUTC);
//       startVN = new Date(todayVN);
//       startVN.setHours(0, 0, 0, 0);

//       endVN = new Date(todayVN);
//       endVN.setHours(23, 59, 59, 999);
//     }

//     // --- Convert về UTC để query ---
//     const startUTC = toUTC(startVN);
//     const endUTC = toUTC(endVN);

//     // --- Lấy appointment ---
//     const appointments = await Appointment.find({
//       doctor: doctorId,
//       datetime: { $gte: startUTC, $lte: endUTC },
//       status: { $ne: 'cancelled' }
//     })
//       .populate('patient', 'fullName email')
//       .sort({ datetime: 1 });

//     // --- Build schedule ---
//     const numDays = view === 'week' ? 7 : 1;
//     const schedule = [];

//     for (let i = 0; i < numDays; i++) {
//       const dayVN = new Date(startVN);
//       dayVN.setDate(startVN.getDate() + i);
//       const dayKey = dayVN.toISOString().split('T')[0]; // YYYY-MM-DD VN

//       // Khởi tạo slot giờ làm việc
//       const slots = generateTimeSlots().map(time => ({ time, appointment: null }));

//       // Gán appointment
//       const apptsOfDay = appointments.filter(appt => {
//         const apptVN = toVN(appt.datetime);
//         const apptDateStr = apptVN.toISOString().split('T')[0];
//         return apptDateStr === dayKey;
//       });

//       apptsOfDay.forEach(appt => {
//         const apptVN = toVN(appt.datetime);
//         const slotTime = `${apptVN.getHours().toString().padStart(2,'0')}:${apptVN.getMinutes().toString().padStart(2,'0')}`;
//         const slot = slots.find(s => s.time === slotTime);
//         if (slot) {
//           slot.appointment = {
//             _id: appt._id,
//             patient: appt.patient,
//             status: appt.status
//           };
//         }
//       });

//       schedule.push({ date: dayKey, slots });
//     }

//     res.json(schedule);

//   } catch (err) {
//     console.error('Lỗi lấy lịch làm việc:', err);
//     res.status(500).json({ error: 'Lỗi server', details: err.message });
//   }
// };

// module.exports = { getWorkSchedule };
