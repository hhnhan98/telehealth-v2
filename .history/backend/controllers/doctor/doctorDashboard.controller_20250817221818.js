// controllers/doctor/doctorDashboard.controller.js
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');

// --- Dashboard controller ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // --- Lấy ngày hôm nay theo local time (VN) ---
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // --- Lịch hẹn hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: todayStr,
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'fullName email')
      .sort({ time: 1 });

    // --- Tính tổng lượt khám tuần này ---
    // Lấy ngày thứ 2 đầu tuần
    const dayOfWeek = today.getDay(); // 0=CN, 1=T2,...6=T7
    const diffToMonday = (dayOfWeek + 6) % 7; // số ngày lùi về thứ 2
    const monday = new Date();
    monday.setDate(today.getDate() - diffToMonday);
    const mondayStr = monday.toISOString().split('T')[0];

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: mondayStr, $lte: todayStr },
      status: { $ne: 'cancelled' },
    });

    // --- Trả về dữ liệu cho FE ---
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
