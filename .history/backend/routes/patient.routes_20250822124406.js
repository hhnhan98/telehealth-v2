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

// Lấy hồ sơ bản thân
router.get('/me', verifyToken, authorize('patient'), patientController.getMyProfile);

// Cập nhật hồ sơ bản thân, có upload avatar
router.put('/me', verifyToken, authorize('patient'), upload.single('avatar'), patientController.updateMyProfile);
router.put('/me/password', verifyToken, patientController.changePassword);


// // ====== Route cho Admin: đang phát triển ======

// // Lấy danh sách tất cả bệnh nhân
// router.get('/', verifyToken, authorize('admin', 'doctor'), patientController.getAllPatients);
// // Lấy thông tin chi tiết một bệnh nhân theo ID
// router.get('/:id', verifyToken, authorize('admin', 'doctor'), patientController.getPatientById);
// // Tạo bệnh nhân mới
// router.post('/', verifyToken, authorize('admin'), patientController.createPatient);
// // Cập nhật thông tin bệnh nhân theo ID
// router.put('/:id', verifyToken, authorize('admin'), patientController.updatePatient);
// // Xóa bệnh nhân theo ID
// router.delete('/:id', verifyToken, authorize('admin'), patientController.deletePatient);

module.exports = router;
