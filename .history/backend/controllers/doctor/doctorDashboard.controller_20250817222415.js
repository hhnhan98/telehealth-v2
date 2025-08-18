// controllers/doctor/doctorDashboard.controller.js
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
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
    const todayStr = todayVN.format('YYYY-MM-DD');

    // --- Lấy lịch hẹn hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: todayStr,
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'fullName email')
      .sort({ time: 1 });

    // --- Tổng lượt khám tuần này (từ thứ 2 tới hôm nay) ---
    const dayOfWeek = todayVN.day(); // 0=CN, 1=T2,...6=T7
    const diffToMonday = (dayOfWeek + 6) % 7; // số ngày lùi về thứ 2
    const mondayVN = todayVN.subtract(diffToMonday, 'day');
    const mondayStr = mondayVN.format('YYYY-MM-DD');

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: mondayStr, $lte: todayStr },
      status: { $ne: 'cancelled' },
    });

    res.json({
      todayAppointments,
      weeklyAppointmentsCount,
    });

  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData };
