const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
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
      default: 'other',
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'],
    },
    address: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
