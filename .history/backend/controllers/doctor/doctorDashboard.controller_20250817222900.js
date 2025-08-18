// controllers/doctor/doctorDashboard.controller.js
const Appointment = require('../../models/Appointment');

// --- Dashboard controller ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // --- Xác định ngày hôm nay theo giờ VN ---
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // --- Lịch hẹn hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 });

    // --- Tính tổng lượt khám tuần này ---
    const dayOfWeek = now.getDay(); // 0=CN, 1=T2,...6=T7
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      datetime: { $gte: monday, $lte: now },
      status: { $ne: 'cancelled' },
    });

    res.json({ todayAppointments, weeklyAppointmentsCount });

  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData };
