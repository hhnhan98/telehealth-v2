const express = require('express');
const router = express.Router();
const multer = require('multer');
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Middleware xác thực: chỉ doctor mới truy cập
const authMiddleware = [verifyToken, authorize('doctor')];

// --- Cấu hình Multer để upload avatar ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===================== Profile =====================
router.get('/me', authMiddleware, doctorController.getMyProfile);         
router.put('/me', authMiddleware, upload.single('avatar'), doctorController.updateProfile);
router.put('/me/password', authMiddleware, doctorController.changePassword);

// ===================== Work Schedule =====================
router.get('/work-schedule', authMiddleware, doctorController.getWorkSchedule);

// ===================== Appointment Management =====================
// Lấy tất cả lịch hẹn của bác sĩ
router.get('/appointments', authMiddleware, doctorController.getDoctorAppointments);

// Xem chi tiết 1 appointment
router.get('/appointments/:id', authMiddleware, doctorController.getAppointmentDetail);

// Cập nhật trạng thái lịch hẹn (pending, confirmed, cancelled, completed)
router.patch('/appointments/:id/status', authMiddleware, doctorController.updateAppointmentStatus);

// Hủy lịch hẹn
router.delete('/appointments/:id', authMiddleware, doctorController.cancelAppointment);

// Tạo phiếu khám bệnh cho appointment
router.post('/appointments/:id/medical-receipt', authMiddleware, doctorController.createMedicalReceipt);

router.get('/appointments/by-date', verifyToken, doctorController.getAppointmentsByDate);

module.exports = router;
