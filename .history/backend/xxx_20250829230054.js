// --- Core Logic: CRUD Appointment với phân quyền ---

// Khung giờ cố định
const WORK_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

// --- Lấy khung giờ trống của bác sĩ ---
const getAvailableSlots = async (doctorId, date) => {
  const appointments = await Appointment.find({
    doctor: doctorId,
    datetime: { $gte: new Date(`${date}T00:00`), $lt: new Date(`${date}T23:59`) }
  });
  const bookedTimes = appointments.map(a => a.datetime.toTimeString().slice(0,5));
  return WORK_SLOTS.filter(time => !bookedTimes.includes(time));
};

// --- Tạo lịch hẹn (Patient) ---
const createAppointment = async (patientId, doctorId, date, time) => {
  const available = await getAvailableSlots(doctorId, date);
  if (!available.includes(time)) throw Error('Slot đã được đặt');
  return Appointment.create({ patient: patientId, doctor: doctorId, datetime: new Date(`${date}T${time}`), status: 'pending' });
};

// --- Xem lịch hẹn ---
// Patient: chỉ xem lịch của mình
// Doctor: xem lịch của mình
// Admin: xem tất cả
const getAppointments = async (user) => {
  if (user.role === 'admin') return Appointment.find();
  if (user.role === 'doctor') return Appointment.find({ doctor: user.doctorId });
  if (user.role === 'patient') return Appointment.find({ patient: user.patientId });
};

// --- Xác nhận/Hủy lịch hẹn (Doctor) ---
const updateAppointmentStatus = async (doctorId, appointmentId, status) => {
  const appt = await Appointment.findById(appointmentId);
  if (appt.doctor.toString() !== doctorId) throw Error('Không có quyền');
  appt.status = status; // 'confirmed' hoặc 'cancelled'
  return appt.save();
};
