/**
 * @swagger
 * components:
 *   schemas:
 *     Specialty:
 *       type: object
 *       description: Chuyên khoa y tế (ví dụ Nội tổng quát, Tim mạch, Nhi khoa)
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *           example: "64c456def7890abc123fff88"
 *         name:
 *           type: string
 *           description: Tên chuyên khoa
 *           example: "Tim mạch"
 *         locations:
 *           type: array
 *           description: Danh sách cơ sở y tế có chuyên khoa này
 *           items:
 *             type: string
 *             description: ObjectId tham chiếu đến Location
 *             example: "64c123abc456def7890aaa22"
 *         doctors:
 *           type: array
 *           description: Danh sách bác sĩ thuộc chuyên khoa
 *           items:
 *             type: string
 *             description: ObjectId tham chiếu đến User (role doctor)
 *             example: "64c123abc456def7890aaa33"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - locations
 */
const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }],
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

specialtySchema.index({ name: 1, locations: 1 }, { unique: true });

specialtySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Specialty', specialtySchema);
