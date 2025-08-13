const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // 1️⃣ Lịch khám hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      time: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName').sort({ time: 1 });

    // 2️⃣ Tổng số bệnh nhân
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // 3️⃣ Hồ sơ bệnh án mới 7 ngày
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecordsCount = await MedicalRecord.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      doctor: doctorId
    });

    res.json({
      todayAppointments,
      totalPatients,
      recentRecordsCount
    });

  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData };
