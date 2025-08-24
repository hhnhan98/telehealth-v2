// routes/user/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng trong hệ thống
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [patient, doctor, admin]
 *         description: Lọc theo vai trò
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Lọc bác sĩ theo chuyên khoa
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */

/**
 * @swagger
 * /users/doctors:
 *   get:
 *     summary: Lấy danh sách bác sĩ theo chuyên khoa
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Tên chuyên khoa
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Lấy thông tin cá nhân của user đang đăng nhập
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin cá nhân của user
 *   put:
 *     summary: Cập nhật thông tin cá nhân của user đang đăng nhập
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               specialty:
 *                 type: string
 *                 description: Chỉ áp dụng cho bác sĩ
 *     responses:
 *       200:
 *         description: Thông tin cá nhân sau khi cập nhật
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Lấy thông tin user theo ID (chỉ admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Thông tin user
 *   put:
 *     summary: Cập nhật thông tin user theo ID (chỉ admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [patient, doctor, admin]
 *               specialty:
 *                 type: string
 *                 description: Chỉ áp dụng cho bác sĩ
 *     responses:
 *       200:
 *         description: Thông tin user sau khi cập nhật
 *   delete:
 *     summary: Xóa user theo ID (chỉ admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Tạo user mới (chỉ admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [patient, doctor, admin]
 *               specialty:
 *                 type: string
 *                 description: Chỉ áp dụng cho bác sĩ
 *     responses:
 *       201:
 *         description: User được tạo thành công
 */

// Routes
router.get('/', userController.getAllUsers);
router.get('/doctors', userController.getDoctorsBySpecialty);
router.get('/me', verifyToken, userController.getMyProfile);
router.put('/me', verifyToken, userController.updateMyProfile);

// Admin Routes
router.get('/:id', verifyToken, authorize('admin'), userController.getUserById);
router.post('/', verifyToken, authorize('admin'), userController.createUser);
router.put('/:id', verifyToken, authorize('admin'), userController.updateUser);
router.delete('/:id', verifyToken, authorize('admin'), userController.deleteUser);

module.exports = router;

// // routes/user/user.routes.js
// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/user.controller');
// const { verifyToken } = require('../middlewares/auth');
// const { authorize } = require('../middlewares/role');

// // Lấy tất cả user (có thể lọc theo role hoặc specialty)
// router.get('/', userController.getAllUsers);

// // Lấy danh sách bác sĩ theo chuyên khoa
// router.get('/doctors', userController.getDoctorsBySpecialty);

// // Lấy thông tin cá nhân của user đang đăng nhập
// router.get('/me', verifyToken, userController.getMyProfile);

// // Cập nhật thông tin cá nhân của user đang đăng nhập
// router.put('/me', verifyToken, userController.updateMyProfile);

// // Admin Routes
// router.get('/:id', verifyToken, authorize('admin'), userController.getUserById);
// router.post('/', verifyToken, authorize('admin'), userController.createUser);
// router.put('/:id', verifyToken, authorize('admin'), userController.updateUser);
// router.delete('/:id', verifyToken, authorize('admin'), userController.deleteUser);

// module.exports = router;