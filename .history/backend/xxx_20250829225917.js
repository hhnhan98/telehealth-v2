// --- Core logic: Lấy khung giờ trống của bác sĩ ---
const getAvailableSlots = async (doctorId, date) => {
  // Khung giờ hành chính cố định
  const slots = [
    '08:00','08:30','09:00','09:30','10:00','10:30',
    '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
  ];

  // Lấy lịch hẹn đã có của bác sĩ trong ngày
  const appointments = await Appointment.find({
    doctor: doctorId,
    datetime: { $gte: new Date(`${date}T00:00`), $lt: new Date(`${date}T23:59`) }
  });

  // Lọc bỏ slot đã bị đặt
  const bookedTimes = appointments.map(a => a.datetime.toTimeString().slice(0,5));
  return slots.filter(time => !bookedTimes.includes(time));
};
