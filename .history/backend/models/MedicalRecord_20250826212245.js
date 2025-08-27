const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dose: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  note: { type: String, default: '' },
});

const medicalRecordSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now }, // ngày khám
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bp: { type: String }, // huyết áp
    pulse: { type: Number }, // nhịp tim
    bmi: { type: Number },
    symptoms: { type: String, required: true },
    diagnosis: { type: String, required: true },
    notes: { type: String },
    prescriptions: [prescriptionSchema],
    conclusion: { type: String, default: '' },
    careAdvice: { type: String, default: '' },
  },
  { timestamps: true }
);


module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
