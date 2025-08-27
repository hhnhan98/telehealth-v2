const express = require('express');
const router = express.Router();
const multer = require('multer');
const doctorController = require('../controllers/doctor.controller');
const patientController = require('../controllers/patient.controller');
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
router.get('/appointments', authDoctor, doctorController.getDoctorAppointments);
router.get('/appointments/date', authDoctor, doctorController.getAppointmentsByDate);
router.get('/appointments/:id', authDoctor, doctorController.getAppointmentDetail);
router.patch('/appointments/:id/status', authDoctor, doctorController.updateAppointmentStatus);
router.delete('/appointments/:id', authDoctor, doctorController.cancelAppointment);
router.post('/appointments/:id/medical-receipt', authDoctor, doctorController.createMedicalReceipt);

// ===================== Patients (Doctor perspective) =====================
router.get('/my-patients', authDoctor, patientController.getMyPatients);
router.get('/:patientId/medical-records', authDoctor, doctorController.getMedicalRecordsByPatient);

module.exports = router;
