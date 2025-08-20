const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
      minlength: [2, 'Họ tên quá ngắn'],
      maxlength: [100, 'Họ tên quá dài'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Vui lòng nhập email'],
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải từ 6 ký tự trở lên'],
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
      default: 'patient',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'],
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
);

// === Hash password trước khi lưu ===
userSchema.pre('save', async function (next) {
  // Hash khi user mới tạo hoặc khi password bị thay đổi
  if (this.isNew || this.isModified('password')) {
    try {
      const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
      this.password = hash;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// === So sánh password ===
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// === Xóa password khi trả về JSON ===
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
