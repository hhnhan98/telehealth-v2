// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    medicalHistory: { // Tiền sử bệnh án  
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// === Virtual: fullName từ user ===
patientSchema.virtual('fullName').get(function () {
  return this.user?.fullName || '';
});

// === Virtual: age tính từ birthYear trong user ===
patientSchema.virtual('age').get(function () {
  if (this.user?.birthYear) {
    return new Date().getFullYear() - this.user.birthYear;
  }
  return null;
});

// === Virtual: avatar từ user ===
patientSchema.virtual('avatar').get(function () {
  return this.user?.avatar || '/uploads/default-avatar.png';
});

// Cho phép trả về virtual khi gọi toObject / toJSON
patientSchema.set('toObject', { virtuals: true });
patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);


// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       unique: true,
//     },
//     address: {
//       type: String,
//       trim: true,
//     },
//     bio: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     medicalHistory: { // Tiền sử bệnh án  
//       type: String,
//       trim: true,
//       default: '',
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Patient', patientSchema);
