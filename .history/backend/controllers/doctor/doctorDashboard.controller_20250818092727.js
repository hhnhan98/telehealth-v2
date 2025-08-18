const Appointment = require('../../models/Appointment');

const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const nowUTC = new Date();

    // --- VN timezone offset ---
    const vnOffset = 7 * 60; // phút
    const todayVN = new Date(nowUTC.getTime() + vnOffset * 60000);

    // --- Hôm nay VN ---
    const todayStartVN = new Date(todayVN);
    todayStartVN.setHours(0, 0, 0, 0);
    const todayEndVN = new Date(todayStartVN);
    todayEndVN.setHours(23, 59, 59, 999);

    // --- Chuyển về UTC để query ---
    const todayStartUTC = new Date(todayStartVN.getTime() - vnOffset * 60000);
    const todayEndUTC = new Date(todayEndVN.getTime() - vnOffset * 60000);

    // --- Hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: todayStartUTC, $lte: todayEndUTC },
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 });

    // --- Tuần này VN (thứ 2 → CN) ---
    const dayOfWeekVN = (todayStartVN.getDay() + 6) % 7; // 0=CN, 1=T2,...
    const mondayVN = new Date(todayStartVN);
    mondayVN.setDate(todayStartVN.getDate() - dayOfWeekVN);
    mondayVN.setHours(0, 0, 0, 0);

    const sundayVN = new Date(mondayVN);
    sundayVN.setDate(mondayVN.getDate() + 6);
    sundayVN.setHours(23, 59, 59, 999);

    // Chuyển về UTC
    const mondayUTC = new Date(mondayVN.getTime() - vnOffset * 60000);
    const sundayUTC = new Date(sundayVN.getTime() - vnOffset * 60000);

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      datetime: { $gte: mondayUTC, $lte: sundayUTC },
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
