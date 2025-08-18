// controllers/doctor/doctorDashboard.controller.js
const Appointment = require('../../models/Appointment');

// --- Dashboard controller ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;
    console.log('>>> Doctor ID:', doctorId);

    // --- Ngày hôm nay theo local time VN ---
    const today = new Date();
    const tzOffset = 7 * 60; // +7 giờ VN
    const todayVN = new Date(today.getTime() + tzOffset * 60000);
    const todayStr = todayVN.toISOString().split('T')[0];
    console.log('>>> Today (VN) YYYY-MM-DD:', todayStr);

    // --- Lấy lịch hẹn hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: todayStr,
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'fullName email')
      .sort({ time: 1 });

    console.log('>>> Today Appointments count:', todayAppointments.length);
    console.log('>>> Today Appointments:', todayAppointments);

    // --- Tính tổng lượt khám tuần này (từ thứ 2) ---
    const dayOfWeek = todayVN.getDay(); // 0=CN,...6=T7
    const diffToMonday = (dayOfWeek + 6) % 7; // số ngày lùi về thứ 2
    const monday = new Date(todayVN);
    monday.setDate(todayVN.getDate() - diffToMonday);
    const mondayStr = monday.toISOString().split('T')[0];
    console.log('>>> Monday (start of week) YYYY-MM-DD:', mondayStr);

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: mondayStr, $lte: todayStr },
      status: { $ne: 'cancelled' },
    });

    console.log('>>> Weekly Appointments Count:', weeklyAppointmentsCount);

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
