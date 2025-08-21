const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Middleware
const authMiddleware = [verifyToken, authorize('doctor')];

// --- Cấu hình Multer ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // thư mục lưu file
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/work-schedule', authMiddleware, doctorController.getWorkSchedule); // Lấy lịch làm việc

// router.patch('/appointment/:id/status', authMiddleware, doctorController.updateAppointmentStatus);
// router.delete('/appointment/:id', authMiddleware, doctorController.cancelAppointment); // Hủy lịch hẹn
// router.post('/appointment/:id/medical-receipt', authMiddleware, doctorController.createMedicalReceipt); // Tạo phiếu khám bệnh
router.get('/me', authMiddleware, doctorController.getMyProfile); // Lấy profile
router.put('/me', authMiddleware, doctorController.updateProfile); // Cập nhật profile  

module.exports = router;
