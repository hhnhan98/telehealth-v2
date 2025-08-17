const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Mỗi bệnh nhân chỉ map 1 User duy nhất
    },

    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ và tên'],
      trim: true,
      minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
      maxlength: [100, 'Tên quá dài'],
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày sinh'],
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Vui lòng chọn giới tính'],
      default: 'other',
    },

    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      match: [/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'],
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Email không hợp lệ'],
    },

    address: {
      type: String,
      trim: true,
    },

    medicalHistory: {
      type: String,
      default: '',
      trim: true,
    },

    allergies: {
      type: [String], // vd: ["penicillin", "hải sản"]
      default: [],
    },

    bloodType: {
      type: String,
      enum: ['A', 'B', 'AB', 'O', 'unknown'],
      default: 'unknown',
    },

    emergencyContact: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, match: [/^[0-9]{9,11}$/, 'SĐT không hợp lệ'] },
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh bệnh nhân
patientSchema.index({ fullName: 'text', phone: 1 });

module.exports = mongoose.model('Patient', patientSchema);
