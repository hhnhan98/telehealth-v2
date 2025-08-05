const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    default: null, // Bệnh nhân không cần chuyên khoa
  },

  // ✅ Thêm các trường thông tin cá nhân được cập nhật bởi người dùng
  phone: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  birthYear: { type: Number, default: null },

}, { timestamps: true });

// Ẩn mật khẩu khi trả về JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Validate: nếu là bác sĩ mà không có chuyên khoa → báo lỗi
userSchema.pre('save', function (next) {
  if (this.role === 'doctor' && !this.specialty) {
    return next(new Error('Bác sĩ phải có chuyên khoa'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);