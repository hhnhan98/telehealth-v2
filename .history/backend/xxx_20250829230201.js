// --- Core Logic: CRUD MedicalRecord với phân quyền ---

// Tạo hồ sơ bệnh án (Doctor)
const createMedicalRecord = async (doctorId, appointmentId, patientId, data) => {
  // Kiểm tra appointment + patient + record tồn tại
  const appt = await Appointment.findById(appointmentId);
  if (!appt) throw Error('Không tìm thấy cuộc hẹn');
  if (await MedicalRecord.findOne({ appointment: appointmentId }))
    throw Error('Record đã tồn tại');

  return MedicalRecord.create({
    appointment: appointmentId,
    doctor: doctorId,
    patient: patientId || appt.patient,
    ...data
  });
};

// Xem danh sách hồ sơ
// Patient: chỉ của mình, Doctor: chỉ của mình, Admin: tất cả
const getMedicalRecords = async (user) => {
  const filter = {};
  if (user.role === 'doctor') filter.doctor = user._id;
  if (user.role === 'patient') filter.patient = user._id;
  return MedicalRecord.find(filter)
    .populate('doctor', 'fullName')
    .populate('patient', 'fullName')
    .populate('appointment', 'date time status')
    .sort({ createdAt: -1 });
};

// Xem chi tiết 1 hồ sơ
const getMedicalRecordById = async (user, recordId) => {
  const record = await MedicalRecord.findById(recordId)
    .populate('doctor', 'fullName')
    .populate('patient', 'fullName')
    .populate('appointment', 'date time status');
  if (!record) throw Error('Không tìm thấy hồ sơ');
  if (user.role === 'patient' && record.patient._id.toString() !== user._id.toString())
    throw Error('Không có quyền truy cập');
  return record;
};

// Cập nhật hồ sơ (Doctor)
const updateMedicalRecord = async (doctorId, recordId, data) => {
  const record = await MedicalRecord.findById(recordId);
  if (!record || record.doctor.toString() !== doctorId) throw Error('Không có quyền');
  Object.assign(record, data);
  return record.save();
};

// Xóa hồ sơ (Admin hoặc Doctor)
const deleteMedicalRecord = async (user, recordId) => {
  const record = await MedicalRecord.findById(recordId);
  if (!record) throw Error('Không tìm thấy hồ sơ');
  if (!(user.role === 'admin' || (user.role === 'doctor' && record.doctor.toString() === user._id.toString())))
    throw Error('Không có quyền xóa');
  return record.deleteOne();
};
