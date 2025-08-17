// controllers/doctor/doctor.controller.js
const Appointment = require('../../models/Appointment');

// Helper sinh slot giờ trống
const generateTimeSlots = (startHour = 8, endHour = 17, intervalMinutes = 30) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2,'0')}:00`);
    slots.push(`${hour.toString().padStart(2,'0')}:30`);
  }
  slots.push(`${endHour.toString().padStart(2,'0')}:00`);
  
  return slots;
};

// --- Xem lịch tuần hoặc ngày ---
const getWeeklySchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName email').sort({ datetime: 1 });

    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      const slots = generateTimeSlots().map(time => ({ time, appointment: null }));

      const appointmentsOfDay = appointments.filter(appt => {
        const apptDate = new Date(appt.datetime);
        return apptDate.toISOString().split('T')[0] === dayKey;
      });

      appointmentsOfDay.forEach(appt => {
        const apptDate = new Date(appt.datetime);
        const slotTime = `${apptDate.getHours().toString().padStart(2,'0')}:${apptDate.getMinutes().toString().padStart(2,'0')}`;
        const slot = slots.find(s => s.time === slotTime);
        if (slot) slot.appointment = { _id: appt._id, patient: appt.patient, status: appt.status };
      });

      schedule.push({ date: dayKey, slots });
    }

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
    if (!appointment) return res.status(404).json({ error: 'Appointment không tồn tại' });
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

module.exports = { getWeeklySchedule, updateAppointmentStatus };
