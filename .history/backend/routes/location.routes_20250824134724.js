/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: API quản lý cơ sở y tế
 */

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Lấy danh sách tất cả cơ sở y tế
 *     description: Trả về danh sách các cơ sở y tế trong hệ thống
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Danh sách cơ sở y tế được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64a1f2c7d9f2c3f9b0a1e7b2
 *                   name:
 *                     type: string
 *                     example: "Bệnh viện Đa khoa Trung ương"
 *                   address:
 *                     type: string
 *                     example: "123 Nguyễn Trãi, Hà Nội"
 *                   phone:
 *                     type: string
 *                     example: "0123456789"
 *       500:
 *         description: Lỗi server
 */
router.get('/', locationController.getAllLocations);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Tạo cơ sở y tế mới (chỉ Admin)
 *     description: API cho phép Admin tạo mới cơ sở y tế
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Phòng khám Quốc tế ABC"
 *               address:
 *                 type: string
 *                 example: "456 Lê Lợi, TP. Hồ Chí Minh"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *     responses:
 *       201:
 *         description: Tạo mới cơ sở y tế thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       401:
 *         description: Chưa được xác thực
 *       403:
 *         description: Không có quyền (chỉ Admin)
 *       500:
 *         description: Lỗi server
 */

router.post(
  '/',
  verifyToken,
  authorize('admin'),
  locationController.createLocation
);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const locationController = require('../controllers/location.controller');
// const { verifyToken } = require('../middlewares/auth');
// const { authorize } = require('../middlewares/role');

// // ------------------------- Routes Location -------------------------

// // Lấy danh sách tất cả cơ sở y tế
// router.get('/', locationController.getAllLocations);

// // Tạo cơ sở y tế mới
// // router.post(
// //   '/',
// //   verifyToken,
// //   authorize('admin'),
// //   locationController.createLocation
// // );

// module.exports = router;