const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', 'doc', 'other'],
    default: 'other'
  }
}, { _id: false }); // không tạo _id cho từng file nhỏ

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: {
    type: String,
    trim: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  files: [fileSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
