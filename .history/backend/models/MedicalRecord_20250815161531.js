// models/MedicalRecord.js
const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // role patient
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // role doctor
      required: true,
    },
    symptoms: { type: String, required: true },
    diagnosis: { type: String },
    prescriptions: { type: String },
    notes: { type: String },
    vitals: {          // gộp HealthRecord vào
      bloodPressure: String,
      heartRate: Number,
      weight: Number,
      height: Number,
    },
    attachments: [{ type: String }], // đường dẫn file ảnh/pdf
    visitDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
/*
const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // giả sử User có role doctor
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
    },
    prescriptions: {
      type: String,
    },
    notes: {
      type: String,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
*/

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
