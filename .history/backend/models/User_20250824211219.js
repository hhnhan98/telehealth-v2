/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: Thông tin người dùng trong hệ thống
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *         fullName:
 *           type: string
 *           example: "Nguyen Van A"
 *         email:
 *           type: string
 *           format: email
 *           example: "nguyenvana@example.com"
 *         role:
 *           type: string
 *           enum: [patient, doctor, admin]
 *           default: patient
 *         birthYear:
 *           type: integer
 *           example: 1995
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           example: male
 *         phone:
 *           type: string
 *           description: Số điện thoại 10 chữ số
 *           example: "0987654321"
 *         avatar:
 *           type: string
 *           description: URL ảnh đại diện
 *           example: "/uploads/default-avatar.png"
 *         bio:
 *           type: string
 *           maxLength: 2000
 *           example: "Bác sĩ chuyên khoa nội tổng quát với 10 năm kinh nghiệm."
 *         specialty:
 *           type: string
 *           description: ID tham chiếu Specialty
 *           example: "64c123abc456def7890aaa12"
 *         location:
 *           type: string
 *           description: ID tham chiếu Location
 *           example: "64c123abc456def7890bbb34"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - fullName
 *         - email
 *         - password
 *         - role
 */

// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const SALT_ROUNDS = 10;

// const userSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: [true, 'Vui lòng nhập họ tên'],
//       trim: true,
//       minlength: [2, 'Họ tên quá ngắn'],
//       maxlength: [100, 'Họ tên quá dài'],
//     },
//     email: {
//       type: String,
//       unique: true,
//       required: [true, 'Vui lòng nhập email'],
//       lowercase: true,
//       trim: true,
//       match: [/.+@.+\..+/, 'Email không hợp lệ'],
//     },
//     password: {
//       type: String,
//       required: [true, 'Vui lòng nhập mật khẩu'],
//       minlength: [6, 'Mật khẩu phải từ 6 ký tự trở lên'],
//     },
//     role: {
//       type: String,
//       enum: ['patient', 'doctor', 'admin'],
//       required: true,
//       default: 'patient',
//     },
//     birthYear: {
//       type: Number,
//       min: 1900,
//       max: new Date().getFullYear(),
//       default: null,
//     },
//     gender: {
//       type: String,
//       enum: ['male', 'female', 'other'],
//       default: 'other',
//     },
//     phone: {
//     type: String,
//     trim: true,
//     match: [/^$|^[0-9]{10}$/, 'Số điện thoại không hợp lệ'],
//     default: '',
//     },    
//     avatar: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     bio: {
//       type: String,
//       trim: true,
//       default: '',
//       maxlength: [2000, 'Bio quá dài'],
//     },
//     specialty: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Specialty',
//     },
//     location: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Location',
//     },
//   },
//   { timestamps: true }
// );

// // === Hash password trước khi lưu ===
// userSchema.pre('save', async function (next) {
//   try {
//     // Chuẩn hóa email
//     if (this.isModified('email')) {
//       this.email = String(this.email).trim().toLowerCase();
//     }

//     // Hash password nếu mới hoặc bị thay đổi
//     if (this.isNew || this.isModified('password')) {
//       const cleanPassword = String(this.password).trim();
//       const isAlreadyHashed = cleanPassword.startsWith('$2b$');
//       if (!isAlreadyHashed) {
//         const hash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);
//         this.password = hash;
//       } else {
//         this.password = cleanPassword;
//       }
//     }

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// // === So sánh password ===
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(String(candidatePassword).trim(), this.password);
// };

// // === Xóa password khi trả về JSON ===
// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.password;
//   return obj;
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Patient = require('./Patient');
const Doctor = require('./Doctor');

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

// === Hash password trước khi lưu ===
userSchema.pre('save', async function (next) {
  try {
    // Chuẩn hóa email
    if (this.isModified('email')) {
      this.email = String(this.email).trim().toLowerCase();
    }

    // Hash password nếu mới hoặc bị thay đổi
    if (this.isNew || this.isModified('password')) {
      const cleanPassword = String(this.password).trim();
      const isAlreadyHashed = cleanPassword.startsWith('$2b$');
      if (!isAlreadyHashed) {
        const hash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);
        this.password = hash;
      } else {
        this.password = cleanPassword;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

// === Tạo Patient hoặc Doctor document tự động sau khi User được tạo ===
userSchema.post('save', async function (doc, next) {
  try {
    if (doc.role === 'patient') {
      // Tạo Patient document
      await Patient.create({ user: doc._id });
    } else if (doc.role === 'doctor') {
      // Tạo Doctor document
      await Doctor.create({
        user: doc._id,
        specialty: doc.specialty,
        location: doc.location,
      });
    }
    next();
  } catch (err) {
    console.error('Lỗi khi tạo document phụ:', err.message);
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