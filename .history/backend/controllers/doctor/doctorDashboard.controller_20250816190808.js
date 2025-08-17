const Appointment = require('../../models/Appointment');
const User = require('../../models/User');

// --- Dashboard data ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName email').sort({ datetime: 1 });

    // Lấy lịch tuần (Thứ 2 → CN)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=CN, 1=T2
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const weekAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $ne: 'cancelled' }
    });

    res.json({
      todayAppointments,
      weeklyAppointmentsCount: weekAppointments.length
    });

  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData };
