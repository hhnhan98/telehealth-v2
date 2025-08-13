// controllers/doctor.controller.js
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

const getDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // 1. Lấy số lượng lịch khám hôm nay
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'cancelled' },
    });

    // 2. Tổng số bệnh nhân
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // 3. Hồ sơ bệnh án mới nhất (limit 5)
    const recentRecords = await MedicalRecord.find({ doctor: doctorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patient', 'fullName email');

    // 4. Lịch trống trong tuần (8:00–17:00, giờ hành chính)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfToday.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $ne: 'cancelled' },
    });

    res.json({
      todayAppointments,
      totalPatients,
      recentRecords,
      weekAppointments,
    });
  } catch (err) {
    console.error('Lỗi khi lấy dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboard };
