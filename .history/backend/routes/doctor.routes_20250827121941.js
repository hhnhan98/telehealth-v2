const express = require('express');
const router = express.Router();
const multer = require('multer');
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Middleware xác thực: chỉ doctor mới truy cập
const authDoctor = [verifyToken, authorize('doctor')];

// --- Multer upload avatar ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// ===================== Profile =====================
router.get('/me', authDoctor, doctorController.getMyProfile);
router.put('/me', authDoctor, upload.single('avatar'), doctorController.updateProfile);
router.put('/me/password', authDoctor, doctorController.changePassword);

// ===================== Work Schedule =====================
router.get('/work-schedule', authDoctor, doctorController.getWorkSchedule);

// ===================== Appointments (Doctor perspective) =====================
// Lấy tất cả lịch hẹn của bác sĩ
router.get('/appointments', authDoctor, doctorController.getDoctorAppointments);

// Lấy lịch hẹn theo ngày (query param: ?date=YYYY-MM-DD)
router.get('/appointments/date', authDoctor, doctorController.getAppointmentsByDate);

// Xem chi tiết 1 appointment
router.get('/appointments/:id', authDoctor, doctorController.getAppointmentDetail);

// Cập nhật trạng thái appointment
router.patch('/appointments/:id/status', authDoctor, doctorController.updateAppointmentStatus);

// Hủy appointment
router.delete('/appointments/:id', authDoctor, doctorController.cancelAppointment);

// Tạo phiếu khám cho appointment
router.post('/appointments/:id/medical-receipt', authDoctor, doctorController.createMedicalReceipt);

router.get('/my-patients', verifyToken, authorize('doctor'), patientController.getMyPatients);
router.get('/:patientId/medical-records', verifyToken, patientController.getMedicalRecordsByPatient);

module.exports = router;
