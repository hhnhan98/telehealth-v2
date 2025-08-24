/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       description: Thông tin chi tiết của bệnh nhân
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *           example: "64c123abc456def7890fff99"
 *         user:
 *           type: string
 *           description: ID tham chiếu đến User
 *           example: "64c123abc456def7890aaa11"
 *         address:
 *           type: string
 *           description: Địa chỉ của bệnh nhân
 *           example: "123 Đường ABC, Quận 1, TP.HCM"
 *         bio:
 *           type: string
 *           description: Giới thiệu ngắn gọn về bệnh nhân
 *           example: "Bệnh nhân quan tâm sức khỏe định kỳ"
 *         medicalHistory:
 *           type: string
 *           description: Tiền sử bệnh án
 *           example: "Tiểu đường type 2, cao huyết áp"
 *         fullName:
 *           type: string
 *           description: Họ và tên (virtual từ User)
 *           example: "Trần Thị B"
 *         avatar:
 *           type: string
 *           description: Ảnh đại diện (virtual từ User)
 *           example: "https://example.com/avatar.jpg"
 *         phone:
 *           type: string
 *           description: Số điện thoại (virtual từ User)
 *           example: "0987654321"
 *         birthYear:
 *           type: integer
 *           description: Năm sinh (virtual từ User)
 *           example: 1990
 *         age:
 *           type: integer
 *           description: Tuổi được tính toán từ birthYear
 *           example: 33
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - user
 */

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
    medicalHistory: {
      type: String, // Tiền sử bệnh án
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals để hiển thị thông tin từ User
patientSchema.virtual('fullName').get(function () {
  return this.user?.fullName || '';
});

patientSchema.virtual('avatar').get(function () {
  return this.user?.avatar || '/uploads/default-avatar.png';
});

patientSchema.virtual('phone').get(function () {
  return this.user?.phone || '';
});

patientSchema.virtual('birthYear').get(function () {
  return this.user?.birthYear || null;
});

patientSchema.virtual('age').get(function () {
  if (this.user?.birthYear) {
    return new Date().getFullYear() - this.user.birthYear;
  }
  return null;
});

module.exports = mongoose.model('Patient', patientSchema);
