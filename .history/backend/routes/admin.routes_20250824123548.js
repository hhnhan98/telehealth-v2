const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Middleware chung cho admin
const adminMiddleware = [verifyToken, authorize('admin')];

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: API dành cho quản trị viên
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
router.get('/users', adminMiddleware, adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Tạo mới người dùng
 *     tags: [Admins]
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
 *     responses:
 *       201:
 *         description: Người dùng được tạo thành công
 */
router.post('/users', adminMiddleware, adminController.createUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/users/:id', adminMiddleware, adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa người dùng
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/users/:id', adminMiddleware, adminController.deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/reset-password:
 *   post:
 *     summary: Reset mật khẩu người dùng
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reset mật khẩu thành công
 */
router.post('/users/:id/reset-password', adminMiddleware, adminController.resetPasswordUser);

/**
 * @swagger
 * /api/admin/doctors:
 *   get:
 *     summary: Lấy danh sách bác sĩ
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 */
router.get('/doctors', adminMiddleware, adminController.getAllDoctors);

/**
 * @swagger
 * /api/admin/doctors:
 *   post:
 *     summary: Tạo mới bác sĩ
 *     tags: [Admins]
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
 *               specialty:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bác sĩ được tạo thành công
 */
router.post('/doctors', adminMiddleware, adminController.createDoctor);

/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   put:
 *     summary: Cập nhật thông tin bác sĩ
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/doctors/:id', adminMiddleware, adminController.updateDoctor);

/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   delete:
 *     summary: Xóa bác sĩ
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/doctors/:id', adminMiddleware, adminController.deleteDoctor);

/**
 * @swagger
 * /api/admin/locations:
 *   get:
 *     summary: Lấy danh sách cơ sở khám bệnh
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách cơ sở
 */
router.get('/locations', adminMiddleware, adminController.getAllLocations);

/**
 * @swagger
 * /api/admin/locations:
 *   post:
 *     summary: Tạo mới cơ sở khám bệnh
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cơ sở được tạo thành công
 */
router.post('/locations', adminMiddleware, adminController.createLocation);

/**
 * @swagger
 * /api/admin/locations/{id}:
 *   put:
 *     summary: Cập nhật cơ sở khám bệnh
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/locations/:id', adminMiddleware, adminController.updateLocation);

/**
 * @swagger
 * /api/admin/locations/{id}:
 *   delete:
 *     summary: Xóa cơ sở khám bệnh
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/locations/:id', adminMiddleware, adminController.deleteLocation);

/**
 * @swagger
 * /api/admin/specialties:
 *   get:
 *     summary: Lấy danh sách chuyên khoa
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách chuyên khoa
 */
router.get('/specialties', adminMiddleware, adminController.getAllSpecialties);

/**
 * @swagger
 * /api/admin/specialties:
 *   post:
 *     summary: Tạo mới chuyên khoa
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chuyên khoa được tạo thành công
 */
router.post('/specialties', adminMiddleware, adminController.createSpecialty);

/**
 * @swagger
 * /api/admin/specialties/{id}:
 *   put:
 *     summary: Cập nhật chuyên khoa
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/specialties/:id', adminMiddleware, adminController.updateSpecialty);

/**
 * @swagger
 * /api/admin/specialties/{id}:
 *   delete:
 *     summary: Xóa chuyên khoa
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/specialties/:id', adminMiddleware, adminController.deleteSpecialty);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/admin.controller');
// const { verifyToken } = require('../middlewares/auth');
// const { authorize } = require('../middlewares/role');

// // ===== Users =====
// router.get('/users', verifyToken, authorize('admin'), adminController.getAllUsers);
// router.post('/users', verifyToken, authorize('admin'), adminController.createUser);
// router.put('/users/:id', verifyToken, authorize('admin'), adminController.updateUser);
// router.delete('/users/:id', verifyToken, authorize('admin'), adminController.deleteUser);
// router.post('/users/:id/reset-password', verifyToken, authorize('admin'), adminController.resetPasswordUser);

// // ===== Doctors =====
// router.get('/doctors', verifyToken, authorize('admin'), adminController.getAllDoctors);
// router.post('/doctors', verifyToken, authorize('admin'), adminController.createDoctor);
// router.put('/doctors/:id', verifyToken, authorize('admin'), adminController.updateDoctor);
// router.delete('/doctors/:id', verifyToken, authorize('admin'), adminController.deleteDoctor);

// // ===== Locations =====
// router.get('/locations', verifyToken, authorize('admin'), adminController.getAllLocations);
// router.post('/locations', verifyToken, authorize('admin'), adminController.createLocation);
// router.put('/locations/:id', verifyToken, authorize('admin'), adminController.updateLocation);
// router.delete('/locations/:id', verifyToken, authorize('admin'), adminController.deleteLocation);

// // ===== Specialties =====
// router.get('/specialties', verifyToken, authorize('admin'), adminController.getAllSpecialties);
// router.post('/specialties', verifyToken, authorize('admin'), adminController.createSpecialty);
// router.put('/specialties/:id', verifyToken, authorize('admin'), adminController.updateSpecialty);
// router.delete('/specialties/:id', verifyToken, authorize('admin'), adminController.deleteSpecialty);

// module.exports = router;
