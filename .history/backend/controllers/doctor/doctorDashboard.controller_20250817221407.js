// controllers/doctor/doctorDashboard.controller.js
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');

// --- Hàm format ngày YYYY-MM-DD ---
const formatDate = d => d.toISOString().split('T')[0];

// --- Dashboard với log chi tiết ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;
    console.log('>>> Doctor ID:', doctorId);

    // --- Lịch hẹn hôm nay ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    console.log('>>> Today range:', startOfDay, '->', endOfDay);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName email').sort({ datetime: 1 });

    console.log('>>> Today appointments found:', todayAppointments.length);

    // --- Lịch hẹn tuần này (từ thứ 2) ---
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=CN, 1=T2,...6=T7
    const diffToMonday = (dayOfWeek + 6) % 7; // số ngày lùi về thứ 2
    const monday = new Date();
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    console.log('>>> Monday this week:', monday);

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      datetime: { $gte: monday, $lte: now },
      status: { $ne: 'cancelled' }
    });

    console.log('>>> Weekly appointments count:', weeklyAppointmentsCount);

    res.json({
      todayAppointments,
      weeklyAppointmentsCount
    });

  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData };
