const Appointment = require('../../models/Appointment');

const generateTimeSlots = () => {
  const slots = [];

  // Buổi sáng
  for (let hour = 8; hour < 11; hour++) {
    slots.push(`${hour.toString().padStart(2,'0')}:00`);
    slots.push(`${hour.toString().padStart(2,'0')}:30`);
  }
  slots.push(`11:00`);

  // Buổi chiều
  for (let hour = 13; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2,'0')}:00`);
    slots.push(`${hour.toString().padStart(2,'0')}:30`);
  }
  slots.push(`17:00`);

  return slots;
};

// ----------------- API: Lấy lịch làm việc -----------------
const getWorkSchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const view = req.query.view || 'day';

    const today = new Date();
    let startDate, endDate;

    if (view === 'week') {
      // Tính ngày đầu tuần (thứ 2)
      const dayOfWeek = today.getDay(); // 0 = CN, 1 = T2
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      // Ngày cuối tuần (CN)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Chỉ hôm nay
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    }

    // Lấy danh sách lịch hẹn trong khoảng
    const appointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' } // loại bỏ hẹn đã hủy
    })
      .populate('patient', 'fullName email')
      .sort({ datetime: 1 });

    const schedule = [];

    // Duyệt từng ngày
    const numDays = view === 'week' ? 7 : 1;
    for (let i = 0; i < numDays; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];

      // Khởi tạo slot giờ làm việc
      const slots = generateTimeSlots().map(time => ({
        time,
        appointment: null,
      }));

      // Gán appointment vào slot
      const apptsOfDay = appointments.filter(appt => {
        const apptDate = new Date(appt.datetime);
        return apptDate.toISOString().split('T')[0] === dayKey;
      });

      apptsOfDay.forEach(appt => {
        const apptDate = new Date(appt.datetime);
        const slotTime = `${apptDate.getHours().toString().padStart(2,'0')}:${apptDate.getMinutes().toString().padStart(2,'0')}`;
        const slot = slots.find(s => s.time === slotTime);
        if (slot) {
          slot.appointment = {
            _id: appt._id,
            patient: appt.patient,
            status: appt.status,
          };
        }
      });

      schedule.push({ date: dayKey, slots });
    }

    res.json(schedule);
  } catch (err) {
    console.error('Lỗi lấy lịch làm việc:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// ----------------- API: Cập nhật trạng thái lịch hẹn -----------------
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment không tồn tại' });
    }

    // Kiểm tra quyền bác sĩ
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Không có quyền cập nhật' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = {
  getWorkSchedule,
  updateAppointmentStatus,
};
