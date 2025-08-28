const express = require('express');
const router = express.Router();
const multer = require('multer');
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const MedicalRecord = require('../models/MedicalRecord');

// Multer upload avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname)
});
const upload = multer({ storage });

// Profile
router.get('/me', verifyToken, authorize('doctor'), doctorController.getMyProfile);
router.put('/me', verifyToken, authorize('doctor'), upload.single('avatar'), doctorController.updateProfile);
router.put('/me/password', verifyToken, authorize('doctor'), doctorController.changePassword);

// Work schedule
router.get('/work-schedule', verifyToken, authorize('doctor'), doctorController.getWorkSchedule);

// Appointments
router.get('/appointments', verifyToken, authorize('doctor'), doctorController.getDoctorAppointments);
router.get('/appointments/date', verifyToken, authorize('doctor'), doctorController.getAppointmentsByDate);
router.get('/appointments/:id', verifyToken, authorize('doctor'), doctorController.getAppointmentDetail);
router.patch('/appointments/:id/status', verifyToken, authorize('doctor'), doctorController.updateAppointmentStatus);
router.delete('/appointments/:id', verifyToken, authorize('doctor'), doctorController.cancelAppointment);
router.post('/appointments/:id/medical-receipt', verifyToken, authorize('doctor'), doctorController.createMedicalReceipt);

// Patients
router.get('/my-patients', verifyToken, authorize('doctor'), doctorController.getMyPatients);
router.get('/:patientId/medical-records', verifyToken, authorize('doctor'), MedicalRecord);

module.exports = router;
