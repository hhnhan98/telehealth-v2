const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule'); // để lấy slot trống
const Doctor = require('../models/Doctor');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { responseSuccess, responseError } = require('../utils/response');

dayjs.extend(utc);
dayjs.extend(timezone);

const getDashboardData = async (req, res) => {
  try {

    // --- Lấy Doctor ID từ User ID ---
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return responseError(res, 'Không tìm thấy bác sĩ', 404);
    }
    const doctorId = doctor._id;

    // --- Ngày hôm nay theo timezone VN ---
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStartUTC = todayVN.startOf('day').utc().toDate();
    const todayEndUTC = todayVN.endOf('day').utc().toDate();

    // --- Lấy lịch hẹn hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: todayStartUTC, $lte: todayEndUTC },
      status: { $ne: 'cancelled' }
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 })
      .lean();

    // --- Số bệnh nhân pending / confirmed hôm nay ---
    const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
    const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;

    // --- Lấy slot hôm nay từ Schedule ---
    const schedule = await Schedule.findOne({ doctorId, date: todayVN.format('YYYY-MM-DD') });
    let totalSlots = 0;
    let bookedSlots = 0;

    if (schedule) {
      totalSlots = schedule.slots.length;
      bookedSlots = schedule.slots.filter(s => s.isBooked).length;
    }
    
    const freeSlots = totalSlots - bookedSlots;
    const bookingRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    // --- Tuần hiện tại (Thứ 2 → Chủ nhật) ---
    const dayOfWeekVN = todayVN.day(); // 0=CN, 1=T2,...
    const mondayVN = todayVN.subtract((dayOfWeekVN + 6) % 7, 'day'); // Thứ 2 đầu tuần
    const sundayVN = mondayVN.add(6, 'day'); // Chủ nhật cuối tuần
    const weekStartUTC = mondayVN.startOf('day').utc().toDate();
    const weekEndUTC = sundayVN.endOf('day').utc().toDate();

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      datetime: { $gte: weekStartUTC, $lte: weekEndUTC },
      status: { $ne: 'cancelled' }
    });


    
    return responseSuccess(res, 'Dashboard data', {
      todayAppointments,
      weeklyAppointmentsCount,
      pendingCount,
      confirmedCount,
      totalSlots,
      bookedSlots,
      freeSlots,
      bookingRate
    });

  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    return responseError(res, 'Lỗi server', 500, err);
  }
};

module.exports = { getDashboardData };