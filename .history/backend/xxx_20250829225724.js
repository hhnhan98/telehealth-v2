// ----- Core AppointmentController (CRUD) -----

// Tạo lịch hẹn
const createAppointment = async (req) => {
  const appointment = await Appointment.create({
    doctor: req.body.doctorId,
    patient: req.user._id,
    datetime: req.body.datetime,
    reason: req.body.reason || '',
    status: 'pending',
    isVerified: false,
    otp: generateOTP()
  });
  await ScheduleService.bookSlot(req.body.doctorId, req.body.date, req.body.time);
  return appointment;
};

// Lấy danh sách lịch hẹn của bệnh nhân
const getAppointments = async (req) => {
  return await Appointment.find({ patient: req.user._id }).sort({ datetime: -1 });
};

// Lấy chi tiết lịch hẹn
const getAppointmentById = async (req) => {
  return await Appointment.findById(req.params.id);
};

// Xác thực OTP
const verifyOtp = async (req) => {
  const appt = await Appointment.findById(req.body.appointmentId);
  if (appt.otp === req.body.otp) {
    appt.isVerified = true;
    appt.status = 'confirmed';
    await appt.save();
  }
  return appt;
};

// Hủy lịch hẹn
const cancelAppointment = async (req) => {
  const appt = await Appointment.findById(req.params.id);
  appt.status = 'cancelled';
  await appt.save();
  await ScheduleService.cancelSlot(appt.doctor, appt.date, appt.time);
  return appt;
};
