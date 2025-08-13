const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ và tên'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
    },
    address: {
      type: String,
    },
    medicalHistory: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
