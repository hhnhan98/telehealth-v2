const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // mỗi user chỉ có thể là 1 doctor
  },
  fullName: {
    type: String,
    required: [true, 'Họ tên bác sĩ là bắt buộc'],
    trim: true,
  },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: [true, 'Chuyên khoa là bắt buộc'],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Cơ sở là bắt buộc'],
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
}, {
  timestamps: true,
});

// Index để tìm theo specialty và location nhanh hơn
doctorSchema.index({ specialty: 1, location: 1 });

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
