const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const MedicalRecord = require('../../models/MedicalRecord');

// Helper: tạo mảng slot giờ trống 8:00–17:00
const generateTimeSlots = (startHour = 8, endHour = 17, intervalMinutes = 30) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2,'0')}:00`);
    slots.push(`${hour.toString().padStart(2,'0')}:30`);
  }
  slots.push(`${endHour.toString().padStart(2,'0')}:00`);
  return slots;
};

// --- Dashboard data ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // --- Lịch hôm nay ---
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    })
    .populate('patient', 'fullName email')
    .sort({ datetime: 1 });

    // --- Tổng số bệnh nhân ---
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // --- Số hồ sơ bệnh án mới 7 ngày ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecordsCount = await MedicalRecord.countDocuments({
      doctor: doctorId,
      createdAt: { $gte: sevenDaysAgo }
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

// --- Lịch tuần nâng cao ---
const getWeeklySchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // --- Xác định tuần hiện tại (Thứ 2 → Chủ nhật) ---
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    // --- Lấy tất cả appointments trong tuần ---
    const appointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfWeek, $lte: endOfWeek }
    })
    .populate('patient', 'fullName email')
    .sort({ datetime: 1 });

    // --- Tạo mảng tuần 7 ngày, mỗi ngày 8:00–17:00 ---
    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      const slots = generateTimeSlots();

      schedule.push({
        date: dayKey,
        slots: slots.map(time => ({ time, appointment: null }))
      });
    }

    // --- Gán appointment vào slot ---
    appointments.forEach(appt => {
      const apptDate = new Date(appt.datetime);
      const dayKey = apptDate.toISOString().split('T')[0];
      const scheduleDay = schedule.find(d => d.date === dayKey);
      if(scheduleDay){
        const slot = scheduleDay.slots.find(s => s.time === appt.time);
        if(slot) slot.appointment = {
          _id: appt._id,
          patient: appt.patient,
          status: appt.status
        };
      }
    });

    res.json(schedule);

  } catch (err) {
    console.error('Lỗi lấy lịch tuần:', err);
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
    if(!appointment) return res.status(404).json({ error: 'Appointment không tồn tại' });

    // Chỉ bác sĩ của lịch mới được update
    if(appointment.doctor.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Không có quyền cập nhật' });

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, appointment });

  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ error:'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData, getWeeklySchedule, updateAppointmentStatus };
