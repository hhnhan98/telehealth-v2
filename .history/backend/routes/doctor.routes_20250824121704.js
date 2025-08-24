// routes/doctor.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Middleware
const authMiddleware = [verifyToken, authorize('doctor')];

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: API dành cho bác sĩ
 */

// --- Cấu hình Multer ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/doctors/me:
 *   get:
 *     summary: Lấy thông tin cá nhân của bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin bác sĩ
 *       401:
 *         description: Chưa xác thực hoặc token không hợp lệ
 */
router.get('/me', authMiddleware, doctorController.getMyProfile);

/**
 * @swagger
 * /api/doctors/me:
 *   put:
 *     summary: Cập nhật thông tin cá nhân của bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               specialty:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.put('/me', authMiddleware, upload.single('avatar'), doctorController.updateProfile);

/**
 * @swagger
 * /api/doctors/me/password:
 *   put:
 *     summary: Đổi mật khẩu bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Sai mật khẩu cũ
 */
router.put('/me/password', verifyToken, doctorController.changePassword);

/**
 * @swagger
 * /api/doctors/work-schedule:
 *   get:
 *     summary: Lấy lịch làm việc của bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [day, week]
 *         required: false
 *         description: Xem lịch theo ngày hoặc tuần
 *     responses:
 *       200:
 *         description: Danh sách lịch làm việc
 */
router.get('/work-schedule', authMiddleware, doctorController.getWorkSchedule);

// Các route dưới đây hiện đang comment trong source
// router.patch('/appointment/:id/status', authMiddleware, doctorController.updateAppointmentStatus);
// router.delete('/appointment/:id', authMiddleware, doctorController.cancelAppointment);
// router.post('/appointment/:id/medical-receipt', authMiddleware, doctorController.createMedicalReceipt);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const doctorController = require('../controllers/doctor.controller');
// const { verifyToken } = require('../middlewares/auth');
// const { authorize } = require('../middlewares/role');

// // Middleware
// const authMiddleware = [verifyToken, authorize('doctor')];

// // --- Cấu hình Multer ---
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage: storage });

// router.get('/me', authMiddleware, doctorController.getMyProfile);         
// router.put('/me', authMiddleware, upload.single('avatar'), doctorController.updateProfile);
// router.put('/me/password', verifyToken, doctorController.changePassword);

// router.get('/work-schedule', authMiddleware, doctorController.getWorkSchedule);                             // Lấy lịch làm việc
// // router.patch('/appointment/:id/status', authMiddleware, doctorController.updateAppointmentStatus);
// // router.delete('/appointment/:id', authMiddleware, doctorController.cancelAppointment);                   // Hủy lịch hẹn
// // router.post('/appointment/:id/medical-receipt', authMiddleware, doctorController.createMedicalReceipt);  // Tạo phiếu khám bệnh

// module.exports = router;
