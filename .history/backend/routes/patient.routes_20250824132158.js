// routes/patient.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// ====== Cấu hình Multer cho upload avatar ======
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: API cho bệnh nhân
 */

/**
 * @swagger
 * /patients/me:
 *   get:
 *     summary: Lấy thông tin cá nhân bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin bệnh nhân hiện tại
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/me', verifyToken, authorize('patient'), patientController.getMyProfile);

/**
 * @swagger
 * /patients/me:
 *   put:
 *     summary: Cập nhật thông tin cá nhân bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Lỗi dữ liệu
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/me', verifyToken, authorize('patient'), upload.single('avatar'), patientController.updateMyProfile);

/**
 * @swagger
 * /api/patients/me/password:
 *   put:
 *     summary: Đổi mật khẩu bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Lỗi dữ liệu
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/me/password', verifyToken, patientController.changePassword);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const patientController = require('../controllers/patient.controller');
// const { verifyToken } = require('../middlewares/auth');
// const { authorize } = require('../middlewares/role');

// // ====== Cấu hình Multer cho upload avatar ======
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage });

// // ===== PatientProfile Route ======
// router.get('/me', verifyToken, authorize('patient'), patientController.getMyProfile);
// router.put('/me', verifyToken, authorize('patient'), upload.single('avatar'), patientController.updateMyProfile); 
// router.put('/me/password', verifyToken, patientController.changePassword);


// // // ====== Route cho Admin: đang phát triển ======

// // // Lấy danh sách tất cả bệnh nhân
// // router.get('/', verifyToken, authorize('admin', 'doctor'), patientController.getAllPatients);
// // // Lấy thông tin chi tiết một bệnh nhân theo ID
// // router.get('/:id', verifyToken, authorize('admin', 'doctor'), patientController.getPatientById);
// // // Tạo bệnh nhân mới
// // router.post('/', verifyToken, authorize('admin'), patientController.createPatient);
// // // Cập nhật thông tin bệnh nhân theo ID
// // router.put('/:id', verifyToken, authorize('admin'), patientController.updatePatient);
// // // Xóa bệnh nhân theo ID
// // router.delete('/:id', verifyToken, authorize('admin'), patientController.deletePatient);

// module.exports = router;
