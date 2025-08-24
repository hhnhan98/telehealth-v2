/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       description: Tin nhắn giữa 2 người dùng trong hệ thống (ví dụ: bác sĩ và bệnh nhân)
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *           example: "64d78a0abc123def456bbb22"
 *         sender:
 *           type: string
 *           description: ID của người gửi (ref: User)
 *           example: "64c1f0d3a1234567890abc12"
 *         receiver:
 *           type: string
 *           description: ID của người nhận (ref: User)
 *           example: "64c1f0d3a9876543210def34"
 *         content:
 *           type: string
 *           description: Nội dung tin nhắn
 *           example: "Xin chào bác sĩ, tôi muốn hỏi về lịch khám."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm tin nhắn được tạo
 *           example: "2025-08-24T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm tin nhắn được chỉnh sửa (nếu có)
 *           example: "2025-08-24T09:31:00.000Z"
 *       required:
 *         - sender
 *         - receiver
 *         - content
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
