const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Liên kết với bảng User
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
      type: String, // Tiểu sử bệnh án
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
