// controllers/doctor.controller.js
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

// Helper sinh slot giờ trống
const generateTimeSlots = (startHour, endHour, intervalMinutes = 30) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2,'0')}:00`);
    slots.push(`${hour.toString().padStart(2,'0')}:30`);
  }
  slots.push(`${endHour.toString().padStart(2,'0')}:00`);
  return slots;
};

const getDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // --- 1. Lấy số lượng lịch khám hôm nay ---
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'cancelled' },
    });

    // --- 2. Tổng số bệnh nhân ---
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // --- 3. Hồ sơ bệnh án mới nhất (limit 5) ---
    const recentRecords = await MedicalRecord.find({ doctor: doctorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patient', 'fullName email');

    // --- 4. Lịch trống trong tuần (8:00–17:00, 30 phút) ---
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const weekAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $ne: 'cancelled' },
    });

    // Tạo lịch trống cho từng ngày
    const weekSchedule = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      day.setHours(0,0,0,0);

      const dayKey = day.toISOString().split('T')[0]; // yyyy-mm-dd
      const slots = generateTimeSlots(8, 17, 30);

      // Lọc các slot đã có appointment
      const appointmentsOfDay = weekAppointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate.toISOString().split('T')[0] === dayKey;
      });

      const occupiedSlots = appointmentsOfDay.map(app => {
        const d = new Date(app.date);
        const h = d.getHours().toString().padStart(2,'0');
        const m = d.getMinutes().toString().padStart(2,'0');
        return `${h}:${m}`;
      });

      const freeSlots = slots.filter(s => !occupiedSlots.includes(s));

      weekSchedule.push({
        date: dayKey,
        freeSlots,
        appointments: appointmentsOfDay.map(app => ({
          _id: app._id,
          patient: app.patient,
          date: app.date,
          status: app.status,
        })),
      });
    }

    res.json({
      todayAppointments,
      totalPatients,
      recentRecords,
      weekSchedule,
    });

  } catch (err) {
    console.error('Lỗi khi lấy dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboard };
