const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor/doctor.controller');
const { verifyToken } = require('../middlewares/auth/auth');
const { authorize } = require('../middlewares/auth/role');

// Middleware
const authMiddleware = [verifyToken, authorize('doctor')];

router.get('/work-schedule', authMiddleware, doctorController.getWorkSchedule); // Lấy lịch làm việc

router.patch('/appointment/:id/status', authMiddleware, doctorController.updateAppointmentStatus);
router.delete('/appointment/:id', authMiddleware, doctorController.cancelAppointment); // Hủy lịch hẹn
router.post('/appointment/:id/medical-receipt', authMiddleware, doctorController.createMedicalReceipt); // Tạo phiếu khám bệnh

module.exports = router;
