/**
 * @swagger
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       description: Thông tin chi tiết về bác sĩ
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *           example: "64c123abc456def7890ccc56"
 *         user:
 *           type: string
 *           description: ID tham chiếu đến User
 *           example: "64c123abc456def7890aaa11"
 *         specialty:
 *           type: string
 *           description: ID chuyên khoa mà bác sĩ thuộc về
 *           example: "64c123abc456def7890bbb22"
 *         location:
 *           type: string
 *           description: ID cơ sở y tế mà bác sĩ làm việc
 *           example: "64c123abc456def7890ddd33"
 *         bio:
 *           type: string
 *           description: Giới thiệu ngắn gọn về bác sĩ
 *           example: "Bác sĩ chuyên khoa tim mạch với hơn 10 năm kinh nghiệm"
 *         fullName:
 *           type: string
 *           description: Họ và tên (lấy từ User, virtual field)
 *           example: "Nguyễn Văn A"
 *         avatar:
 *           type: string
 *           description: Ảnh đại diện (virtual từ User)
 *           example: "https://example.com/avatar.jpg"
 *         phone:
 *           type: string
 *           description: Số điện thoại (virtual từ User)
 *           example: "0912345678"
 *         birthYear:
 *           type: integer
 *           description: Năm sinh (virtual từ User)
 *           example: 1985
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - user
 *         - specialty
 *         - location
 */


const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
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
    bio: {
      type: String,
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

// Index để tìm theo specialty + location nhanh hơn
doctorSchema.index({ specialty: 1, location: 1 });

// Virtuals để hiển thị thông tin từ User
doctorSchema.virtual('fullName').get(function () {
  return this.user?.fullName || '';
});
doctorSchema.virtual('avatar').get(function () {
  return this.user?.avatar || '';
});
doctorSchema.virtual('phone').get(function () {
  return this.user?.phone || '';
});
doctorSchema.virtual('birthYear').get(function () {
  return this.user?.birthYear || null;
});

module.exports = mongoose.model('Doctor', doctorSchema);
