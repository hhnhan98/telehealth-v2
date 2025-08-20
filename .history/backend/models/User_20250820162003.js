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
  try {
    console.log('Pre-save hook triggered for user:', this.email);

    // --- Chuẩn hóa email
    if (this.isModified('email')) {
      console.log('Email before trim/lowercase:', this.email);
      this.email = String(this.email).trim().toLowerCase();
      console.log('✅ Email after trim/lowercase:', this.email);
    }

    // --- Hash password nếu user mới hoặc password bị thay đổi
    if (this.isNew || this.isModified('password')) {
      console.log('🔑 Password before trim:', this.password);
      const cleanPassword = String(this.password).trim();
      console.log('🔑 Password after trim:', cleanPassword);

      const hash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);
      this.password = hash;
      console.log('✅ Password hashed:', this.password);
    } else {
      console.log('ℹ️ Password not modified, skipping hash');
    }

    next();
  } catch (err) {
    console.error('❌ Error in pre-save hook:', err);
    next(err);
  }
});


// === So sánh password ===
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(String(candidatePassword).trim(), this.password);
};

// === Xóa password khi trả về JSON ===
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
