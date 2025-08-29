const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Specialty = require('./Specialty');
const Location = require('./Location');

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
    birthYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^$|^[0-9]{10}$/, 'Số điện thoại không hợp lệ'],
      default: '',
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Bio quá dài'],
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
  },
  { timestamps: true }
);

// Hash mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('email')) this.email = String(this.email).trim().toLowerCase();

    if (this.isNew || this.isModified('password')) {
      const cleanPassword = String(this.password).trim();
      const isAlreadyHashed = cleanPassword.startsWith('$2b$');
      if (!isAlreadyHashed) {
        this.password = await bcrypt.hash(cleanPassword, SALT_ROUNDS);
      } else this.password = cleanPassword;
    }

    next();
  } catch (err) {
    next(err);
  }
});

// So sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(String(candidatePassword).trim(), this.password);
};

// Loại bỏ mật khẩu khi trả về JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Post-save hook: tạo Patient hoặc Doctor document nếu chưa có
userSchema.post('save', async function (doc, next) {
  try {
    if (doc.role === 'patient') {
      const existingPatient = await Patient.findOne({ user: doc._id });
      if (!existingPatient) await Patient.create({ user: doc._id });
    } else if (doc.role === 'doctor') {
      const existingDoctor = await Doctor.findOne({ user: doc._id });
      if (!existingDoctor) {
        const doctorDoc = await Doctor.create({
          user: doc._id,
          specialty: doc.specialty,
          location: doc.location,
        });

        // Chỉ cập nhật Specialty, không update Location nữa ---
        if (doc.specialty) {
          const spec = await Specialty.findById(doc.specialty);
          if (spec) {
            spec.doctors = spec.doctors || [];
            if (!spec.doctors.includes(doc._id)) spec.doctors.push(doc._id);
            await spec.save();
          }
        }

        // Location không còn lưu doctor array, bỏ qua update Location
      }
    }

    next();
  } catch (err) {
    // TODO: Xử lý logging chi tiết hơn khi triển khai production
    next(); // Không throw lỗi nữa, tránh fail save user
  }
});

module.exports = mongoose.model('User', userSchema);