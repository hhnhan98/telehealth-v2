// backend/models/MedicalRecord.js
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dose: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  note: { type: String, default: '' },
}, { _id: false });

const medicalRecordSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  doctor: { // <-- trỏ tới Doctor (NOT User)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: { // <-- trỏ tới Patient
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },

  // Thông tin bác sĩ/ bệnh nhân snapshot tại thời điểm khám
  // Không liên kết trực tiếp tới User/Doctor/Patient nữa
  doctorSnapshot: {
    fullName: { type: String, required: true },
    specialty: { type: String, default: '' },       // có thể là ObjectId cũ nếu muốn liên kết
    specialtyName: { type: String, default: '' },   // thêm: lưu tên chuyên khoa
    location: { type: String, default: '' },        // có thể là ObjectId cũ
    locationName: { type: String, default: '' }     // thêm: lưu tên cơ sở
  },
  patientSnapshot: {
    fullName: { type: String, required: true },
    birthYear: { type: Number },
    address: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  date: { type: Date, default: Date.now },
  height: { type: Number },
  weight: { type: Number },
  bp: { type: String },         // huyết áp
  pulse: { type: Number },      // nhịp tim
  bmi: { type: Number },

  symptoms: { type: String, required: true },
  diagnosis: { type: String, required: true },
  notes: { type: String },
  prescriptions: [prescriptionSchema],
  conclusion: { type: String, default: '' },
  careAdvice: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
