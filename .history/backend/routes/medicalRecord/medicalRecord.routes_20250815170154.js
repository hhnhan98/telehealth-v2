// routes/medicalRecord.routes.js
const express = require('express');
const router = express.Router();
const medicalRecordController = require('../../controllers/medicalRecord.controller');
const { verifyToken } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

// Lấy hồ sơ bệnh án theo bệnh nhân (bác sĩ hoặc admin)
router.get('/patient/:patientId', verifyToken, authorize('admin', 'doctor'), medicalRecordController.getRecordsByPatient);

// Tạo hồ sơ bệnh án (bác sĩ)
router.post('/', verifyToken, authorize('doctor'), medicalRecordController.createMedicalRecord);

// Cập nhật hồ sơ bệnh án (bác sĩ)
router.put('/:id', verifyToken, authorize('doctor'), medicalRecordController.updateMedicalRecord);

// Xóa hồ sơ bệnh án (admin)
router.delete('/:id', verifyToken, authorize('admin'), medicalRecordController.deleteMedicalRecord);

module.exports = router;
