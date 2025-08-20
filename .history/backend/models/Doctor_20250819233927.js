const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: true, // bác sĩ chỉ thuộc 1 chuyên khoa
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'],
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

// Index để tìm bác sĩ theo chuyên khoa nhanh
doctorSchema.index({ specialty: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);

// const mongoose = require('mongoose');

// const doctorSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       unique: true,
//     },
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     specialty: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Specialty',
//       required: true,
//     },
//     location: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Location',
//       required: true,
//     },
//     phone: {
//       type: String,
//       match: [/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'],
//       default: '',
//     },
//     bio: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Doctor', doctorSchema);
