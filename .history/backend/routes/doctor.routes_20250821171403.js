const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Middleware
const authMiddleware = [verifyToken, authorize('doctor')];

router.get('/work-schedule', authMiddleware, doctorController.getWorkSchedule); // Lấy lịch làm việc

router.patch('/appointment/:id/status', authMiddleware, doctorController.updateAppointmentStatus);
router.delete('/appointment/:id', authMiddleware, doctorController.cancelAppointment); // Hủy lịch hẹn
router.post('/appointment/:id/medical-receipt', authMiddleware, doctorController.createMedicalReceipt); // Tạo phiếu khám bệnh
// GET profile bác sĩ
router.get('/me', authMiddleware, doctorController.getMyProfile);

// PUT cập nhật profile bác sĩ
router.put('/me', authMiddleware, doctorController.updateProfile);
module.exports = router;
