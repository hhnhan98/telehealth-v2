// controllers/doctor/doctorDashboard.controller.js
const Appointment = require('../../models/Appointment');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    console.log('>>> Doctor ID:', doctorId);

    // --- Ngày hôm nay VN ---
    const todayVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const startOfDay = todayVN.startOf('day').toDate();
    const endOfDay = todayVN.endOf('day').toDate();
    console.log('>>> Today VN startOfDay:', startOfDay);
    console.log('>>> Today VN endOfDay:', endOfDay);

    // --- Lấy lịch hẹn hôm nay ---
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 });

    console.log('>>> Today Appointments count:', todayAppointments.length);
    console.log('>>> Today Appointments data:', todayAppointments);

    res.json({ todayAppointments });
  } catch (err) {
    console.error('Lỗi lấy lịch hẹn hôm nay:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getTodayAppointments };
