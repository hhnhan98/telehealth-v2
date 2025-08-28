/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       description: Cơ sở y tế, bệnh viện hoặc phòng khám
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh bởi MongoDB
 *           example: "64c123abc456def7890fff99"
 *         name:
 *           type: string
 *           description: Tên cơ sở y tế
 *           example: "Bệnh viện Chợ Rẫy"
 *         address:
 *           type: string
 *           description: Địa chỉ cơ sở y tế
 *           example: "201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM"
 *         specialties:
 *           type: array
 *           description: Danh sách chuyên khoa tại cơ sở
 *           items:
 *             type: string
 *             description: ObjectId tham chiếu đến Specialty
 *             example: "64c123abc456def7890aaa22"
 *         doctors:
 *           type: array
 *           description: Danh sách bác sĩ thuộc cơ sở
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
 */
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    address: { type: String, default: '' },
    specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }],
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

locationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Location', locationSchema);
