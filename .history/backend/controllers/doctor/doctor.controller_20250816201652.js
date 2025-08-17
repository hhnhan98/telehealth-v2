const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const MedicalRecord = require('../../models/MedicalRecord');
const { getDashboardData } = require('./doctorDashboard.controller');

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

// --- Dashboard ---
const getDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // --- Lấy lịch hôm nay ---
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName email').sort({ date: 1 });

    // --- Tổng số bệnh nhân ---
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // --- Hồ sơ bệnh án mới nhất (7 ngày) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecords = await MedicalRecord.find({
      doctor: doctorId,
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('patient', 'fullName email');

    // --- Lịch tuần (8:00–17:00, 30 phút) ---
    const today = new Date();
    const dayOfWeek = today.getDay();
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
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName email');

    const weekSchedule = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];

      const slots = generateTimeSlots(8,17,30);

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
          status: app.status
        }))
      });
    }

    res.json({ todayAppointments, totalPatients, recentRecords, weekSchedule });
  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// --- Cập nhật trạng thái appointment ---
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatus = ['pending','confirmed','cancelled','completed'];
    if (!allowedStatus.includes(status)) return res.status(400).json({ error: 'Trạng thái không hợp lệ' });

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Appointment không tồn tại' });

    // Chỉ bác sĩ mới được cập nhật lịch của mình
    if (appointment.doctor.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Không có quyền cập nhật' });

    appointment.status = status;
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ error:'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData, updateAppointmentStatus };
