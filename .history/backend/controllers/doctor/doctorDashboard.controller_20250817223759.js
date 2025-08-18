const Appointment = require('../../models/Appointment');

// --- Dashboard controller ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;
    console.log('>>> Doctor ID:', doctorId);

    // --- Lấy ngày hôm nay theo VN timezone ---
    const now = new Date();
    const tzOffset = 7 * 60; // +7 giờ VN
    const todayStart = new Date(now.getTime() + tzOffset * 60000);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    console.log('>>> Today start (VN):', todayStart);
    console.log('>>> Today end (VN):', todayEnd);

    // --- Lịch hẹn hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 });

    console.log('>>> Today Appointments count:', todayAppointments.length);

    // --- Lịch hẹn tuần này (từ thứ 2 VN) ---
    const dayOfWeek = todayStart.getDay(); // 0=CN, 1=T2,...6=T7
    const diffToMonday = (dayOfWeek + 6) % 7; // số ngày lùi về thứ 2
    const mondayStart = new Date(todayStart);
    mondayStart.setDate(todayStart.getDate() - diffToMonday);
    mondayStart.setHours(0, 0, 0, 0);

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      datetime: { $gte: mondayStart, $lte: todayEnd },
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
