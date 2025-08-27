// controllers/doctor/doctorDashboard.controller.js
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const { responseSuccess, responseError } = require('../utils/response');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // --- Ngày hôm nay theo timezone VN ---
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayStartUTC = todayVN.startOf('day').utc().toDate();
    const todayEndUTC = todayVN.endOf('day').utc().toDate();

    console.log('>>> Today UTC range:', todayStartUTC, '-', todayEndUTC);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: todayStartUTC, $lte: todayEndUTC },
      status: { $ne: 'cancelled' }
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 })
      .lean(); // trả plain object để FE dễ xử lý

    // --- Tuần hiện tại (Thứ 2 → Chủ nhật) theo VN ---
    const dayOfWeekVN = todayVN.day(); // 0=CN, 1=T2,...
    const mondayVN = todayVN.subtract((dayOfWeekVN + 6) % 7, 'day'); // Thứ 2 đầu tuần
    const sundayVN = mondayVN.add(6, 'day'); // Chủ nhật cuối tuần

    const weekStartUTC = mondayVN.startOf('day').utc().toDate();
    const weekEndUTC = sundayVN.endOf('day').utc().toDate();

    console.log('>>> Week UTC range:', weekStartUTC, '-', weekEndUTC);

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      datetime: { $gte: weekStartUTC, $lte: weekEndUTC },
      status: { $ne: 'cancelled' }
    });

    return responseSuccess(res, 'Dashboard data', {
      todayAppointments,
      weeklyAppointmentsCount
    });

  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    return responseError(res, 'Lỗi server', 500, err);
  }
};

module.exports = { getDashboardData };
