const Appointment = require('../../models/Appointment');

// --- Dashboard controller chuẩn UTC ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;
    console.log('>>> Doctor ID:', doctorId);

    // --- Lấy thời điểm hiện tại UTC ---
    const nowUTC = new Date();
    console.log('>>> Current UTC:', nowUTC);

    // --- Tính khoảng thời gian hôm nay theo VN timezone ---
    const vnOffset = 7 * 60; // +7 giờ
    const todayStartUTC = new Date(nowUTC.getTime() + vnOffset * 60000);
    todayStartUTC.setHours(0, 0, 0, 0);
    const todayEndUTC = new Date(todayStartUTC);
    todayEndUTC.setHours(23, 59, 59, 999);

    // Chuyển về UTC trước khi query Mongo
    const todayStart = new Date(todayStartUTC.getTime() - vnOffset * 60000);
    const todayEnd = new Date(todayEndUTC.getTime() - vnOffset * 60000);

    console.log('>>> Today UTC start:', todayStart);
    console.log('>>> Today UTC end:', todayEnd);

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
    const dayOfWeekVN = (todayStartUTC.getDay() + 6) % 7; // 0=CN → 0, 1=T2 → 1,...
    const mondayStartUTC = new Date(todayStartUTC);
    mondayStartUTC.setDate(todayStartUTC.getDate() - dayOfWeekVN);
    mondayStartUTC.setHours(0, 0, 0, 0);

    const mondayStart = new Date(mondayStartUTC.getTime() - vnOffset * 60000);

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
