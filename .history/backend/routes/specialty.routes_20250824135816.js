/**
 * @swagger
 * tags:
 *   name: Specialties
 *   description: API quản lý chuyên khoa
 */

const express = require('express');
const router = express.Router();
const { getAllSpecialties } = require('../controllers/specialty.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

/**
 * @swagger
 * /api/specialties:
 *   get:
 *     summary: Lấy danh sách tất cả chuyên khoa
 *     description: Trả về danh sách các chuyên khoa hiện có trong hệ thống
 *     tags: [Specialties]
 *     responses:
 *       200:
 *         description: Danh sách chuyên khoa được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64a1f2c7d9f2c3f9b0a1e7b3
 *                   name:
 *                     type: string
 *                     example: "Nội tổng quát"
 *                   description:
 *                     type: string
 *                     example: "Khám và điều trị các bệnh lý nội khoa"
 *       500:
 *         description: Lỗi server
 */
router.get('/', getAllSpecialties);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { getAllSpecialties } = require('../controllers/specialty.controller');
// const { verifyToken } = require('../middlewares/auth');
// const { authorize } = require('../middlewares/role');

// // Lấy danh sách tất cả chuyên khoa
// router.get('/', getAllSpecialties);

// module.exports = router;