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
    required: [true, 'Chuyên khoa là bắt buộc'],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Cơ sở y tế là bắt buộc'],
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
},
);

// Index để tìm theo specialty + location nhanh hơn
doctorSchema.index({ specialty: 1, location: 1 });

// Virtual: hiển thị tên bác sĩ trực tiếp từ User
doctorSchema.virtual('fullName').get(function() {
  return this.user?.fullName || '';
});

module.exports = mongoose.model('Doctor', doctorSchema);
